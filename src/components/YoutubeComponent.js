import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import {
  FaYoutube,
  FaSpinner,
  FaExclamationTriangle,
  FaCheck,
  FaInfoCircle,
} from "react-icons/fa";
import axios from "axios";
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

  const extractVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const fetchVideoInfo = useCallback(
    async (videoId) => {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`
        );

        if (response.data.items.length === 0) {
          throw new Error(t("errors.videoNotFound"));
        }

        const videoData = response.data.items[0];
        setVideoInfo({
          id: videoId,
          title: videoData.snippet.title,
          thumbnail: videoData.snippet.thumbnails.high.url,
          duration: videoData.contentDetails.duration,
          author: videoData.snippet.channelTitle,
        });
        setShowPreview(true);
      } catch (err) {
        setError(t("errors.fetchVideoInfoFailed"));
        console.error("Error fetching video info:", err);
      }
    },
    [t]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidUrl) return;

    setLoading(true);
    setError(null);

    try {
      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error(t("errors.invalidVideoId"));
      }

      // Fetch video info first
      await fetchVideoInfo(videoId);

      // Then fetch transcript
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/videos/transcript`,
        { url }
      );

      // Navigate to transcript page with data
      history.push("/transcript", {
        text: response.data.transcript,
        videoInfo,
        settings: {
          fontSize: "medium",
          lineSpacing: "normal",
          showTimestamps: false,
          highlightKeywords: true,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          t("errors.transcriptFetchFailed")
      );
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setShowPreview(false);
    setVideoInfo(null);
  };

  const handleClear = () => {
    setUrl("");
    setError(null);
    setShowPreview(false);
    setVideoInfo(null);
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
