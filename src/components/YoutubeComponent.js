import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import {
  FaYoutube,
  FaSpinner,
  FaExclamationTriangle,
  FaCheck,
  FaInfoCircle,
} from "react-icons/fa";
import api from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import "./YoutubeComponent.css";

const YoutubeComponent = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);

  const history = useHistory();
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();

  // YouTube URL validation regex
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

  useEffect(() => {
    const validateUrl = () => {
      const isValid = youtubeRegex.test(url);
      setIsValidUrl(isValid);
      if (!isValid && url) {
        setError(t("errors.invalidYoutubeUrl"));
      } else {
        setError(null);
      }
    };

    validateUrl();
  }, [url, t]);

  const validateVideo = useCallback(async (videoUrl) => {
    try {
      const response = await api.videos.validateVideo(videoUrl);
      setValidationStatus(response);
      return response.valid;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  const fetchVideoInfo = useCallback(async (videoUrl) => {
    try {
      const response = await api.videos.getVideoMetadata(videoUrl);
      setVideoInfo({
        id: response.id,
        title: response.title,
        thumbnail: response.thumbnail,
        duration: response.duration,
        author: response.author,
        hasTranscript: response.hasTranscript,
      });
      setShowPreview(true);
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidUrl) return;

    setLoading(true);
    setError(null);

    try {
      // First validate the video
      const isValid = await validateVideo(url);
      if (!isValid) {
        throw new Error(t("errors.invalidVideo"));
      }

      // Then fetch video info
      const videoData = await fetchVideoInfo(url);
      if (!videoData) {
        throw new Error(t("errors.fetchVideoInfoFailed"));
      }

      if (!videoData.hasTranscript) {
        throw new Error(t("errors.noTranscriptAvailable"));
      }

      // Finally fetch transcript
      const response = await api.videos.getTranscript(url);

      // Navigate to transcript page with data
      history.push("/transcript", {
        text: response.transcript,
        videoInfo: videoData,
        settings: {
          fontSize: "medium",
          lineSpacing: "normal",
          showTimestamps: false,
          highlightKeywords: true,
        },
      });
    } catch (err) {
      setError(err.message);
      console.error("Error processing video:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setShowPreview(false);
    setVideoInfo(null);
    setValidationStatus(null);
  };

  const handleClear = () => {
    setUrl("");
    setError(null);
    setShowPreview(false);
    setVideoInfo(null);
    setValidationStatus(null);
  };

  return (
    <div className={`youtube-component ${isDarkMode ? "dark-mode" : ""}`}>
      <div className="youtube-header">
        <FaYoutube className="youtube-icon" />
        <h1>{t("youtube.title")}</h1>
        <p className="youtube-description">{t("youtube.description")}</p>
      </div>

      <form onSubmit={handleSubmit} className="youtube-form">
        <div className="input-group">
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder={t("youtube.urlPlaceholder")}
            className={error ? "error" : isValidUrl ? "valid" : ""}
            aria-label={t("youtube.urlInputLabel")}
          />
          {url && (
            <button
              type="button"
              className="clear-button"
              onClick={handleClear}
              aria-label={t("youtube.clearUrl")}
            >
              ×
            </button>
          )}
        </div>

        {error && (
          <div className="error-message" role="alert">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        {isValidUrl && !error && (
          <div className="success-message">
            <FaCheck />
            <span>{t("youtube.validUrl")}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isValidUrl}
          className="submit-button"
        >
          {loading ? (
            <>
              <FaSpinner className="spinner" />
              {t("youtube.loading")}
            </>
          ) : (
            t("youtube.submit")
          )}
        </button>
      </form>

      {showPreview && videoInfo && (
        <div className="video-preview">
          <h2>{t("youtube.preview")}</h2>
          <div className="preview-content">
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              className="video-thumbnail"
            />
            <div className="video-details">
              <h3>{videoInfo.title}</h3>
              <p className="video-author">{videoInfo.author}</p>
              <p className="video-duration">{videoInfo.duration}</p>
              {!videoInfo.hasTranscript && (
                <p className="video-warning">
                  {t("youtube.noTranscriptWarning")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="youtube-info">
        <FaInfoCircle />
        <p>{t("youtube.info")}</p>
      </div>
    </div>
  );
};

export default YoutubeComponent;
