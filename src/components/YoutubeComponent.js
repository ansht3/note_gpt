import React, { useState, useEffect, useCallback, useRef } from "react";
import { useHistory } from "react-router-dom";
import {
  FaYoutube,
  FaSpinner,
  FaExclamationTriangle,
  FaCheck,
  FaInfoCircle,
  FaHistory,
  FaBookmark,
  FaCog,
  FaShare,
  FaLanguage,
} from "react-icons/fa";
import api from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import "./YoutubeComponent.css";

const YoutubeComponent = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);
  const [recentVideos, setRecentVideos] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    autoPlay: false,
    defaultLanguage: "en",
    showSubtitles: true,
    quality: "auto",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [availableLanguages, setAvailableLanguages] = useState([]);

  const history = useHistory();
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const { showToast } = useToast();
  const inputRef = useRef(null);

  // YouTube URL validation regex
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

  useEffect(() => {
    // Load recent videos from localStorage
    const savedVideos = JSON.parse(
      localStorage.getItem("recentVideos") || "[]"
    );
    setRecentVideos(savedVideos);

    // Load settings from localStorage
    const savedSettings = JSON.parse(
      localStorage.getItem("youtubeSettings") || "{}"
    );
    setSettings((prev) => ({ ...prev, ...savedSettings }));

    // Focus input on mount
    inputRef.current?.focus();
  }, []);

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

  const validateVideo = useCallback(
    async (videoUrl) => {
      try {
        const response = await api.videos.validateVideo(videoUrl);
        setValidationStatus(response);
        return response.valid;
      } catch (err) {
        setError(err.message);
        showToast(err.message, "error");
        return false;
      }
    },
    [showToast]
  );

  const fetchVideoInfo = useCallback(
    async (videoUrl) => {
      try {
        const response = await api.videos.getVideoMetadata(videoUrl);
        setVideoInfo({
          id: response.id,
          title: response.title,
          thumbnail: response.thumbnail,
          duration: response.duration,
          author: response.author,
          hasTranscript: response.hasTranscript,
          availableLanguages: response.availableLanguages,
        });
        setAvailableLanguages(response.availableLanguages || []);
        setShowPreview(true);
        return response;
      } catch (err) {
        setError(err.message);
        showToast(err.message, "error");
        return null;
      }
    },
    [showToast]
  );

  const updateRecentVideos = useCallback((videoData) => {
    setRecentVideos((prev) => {
      const newVideos = [
        { ...videoData, timestamp: new Date() },
        ...prev.filter((v) => v.id !== videoData.id),
      ].slice(0, 5);
      localStorage.setItem("recentVideos", JSON.stringify(newVideos));
      return newVideos;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidUrl) return;

    setLoading(true);
    setError(null);
    setIsProcessing(true);

    try {
      // Step 1: Validate video
      setProcessingStep("validating");
      const isValid = await validateVideo(url);
      if (!isValid) {
        throw new Error(t("errors.invalidVideo"));
      }

      // Step 2: Fetch video info
      setProcessingStep("fetching");
      const videoData = await fetchVideoInfo(url);
      if (!videoData) {
        throw new Error(t("errors.fetchVideoInfoFailed"));
      }

      if (!videoData.hasTranscript) {
        throw new Error(t("errors.noTranscriptAvailable"));
      }

      // Step 3: Fetch transcript
      setProcessingStep("processing");
      const response = await api.videos.getTranscript(url);

      // Update recent videos
      updateRecentVideos(videoData);

      // Navigate to transcript page with data
      history.push("/transcript", {
        text: response.transcript,
        videoInfo: videoData,
        settings: {
          ...settings,
          fontSize: "medium",
          lineSpacing: "normal",
          showTimestamps: false,
          highlightKeywords: true,
        },
      });
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
      console.error("Error processing video:", err);
    } finally {
      setLoading(false);
      setIsProcessing(false);
      setProcessingStep("");
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
    inputRef.current?.focus();
  };

  const handleSettingsChange = (newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("youtubeSettings", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRecentVideoClick = (video) => {
    setUrl(`https://youtube.com/watch?v=${video.id}`);
    setShowPreview(true);
    setVideoInfo(video);
  };

  const handleShare = async () => {
    if (!videoInfo) return;

    try {
      await navigator.share({
        title: videoInfo.title,
        text: `Check out this video: ${videoInfo.title}`,
        url: `https://youtube.com/watch?v=${videoInfo.id}`,
      });
      showToast(t("messages.shared"), "success");
    } catch (err) {
      if (err.name !== "AbortError") {
        showToast(t("errors.shareFailed"), "error");
      }
    }
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
            ref={inputRef}
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
              {isProcessing
                ? t(`processing.${processingStep}`)
                : t("youtube.loading")}
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
              <div className="video-actions">
                <button
                  className="action-button secondary"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <FaCog />
                  {t("youtube.settings")}
                </button>
                <button
                  className="action-button secondary"
                  onClick={handleShare}
                >
                  <FaShare />
                  {t("youtube.share")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="settings-panel">
          <h3>{t("youtube.settings")}</h3>
          <div className="settings-content">
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoPlay}
                  onChange={(e) =>
                    handleSettingsChange({ autoPlay: e.target.checked })
                  }
                />
                {t("youtube.settings.autoPlay")}
              </label>
            </div>
            <div className="setting-item">
              <label>
                {t("youtube.settings.defaultLanguage")}
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) =>
                    handleSettingsChange({ defaultLanguage: e.target.value })
                  }
                >
                  {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showSubtitles}
                  onChange={(e) =>
                    handleSettingsChange({ showSubtitles: e.target.checked })
                  }
                />
                {t("youtube.settings.showSubtitles")}
              </label>
            </div>
          </div>
        </div>
      )}

      {recentVideos.length > 0 && (
        <div className="recent-videos">
          <h3>
            <FaHistory />
            {t("youtube.recentVideos")}
          </h3>
          <div className="recent-videos-list">
            {recentVideos.map((video) => (
              <div
                key={video.id}
                className="recent-video-item"
                onClick={() => handleRecentVideoClick(video)}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="recent-video-thumbnail"
                />
                <div className="recent-video-info">
                  <h4>{video.title}</h4>
                  <p>{video.author}</p>
                </div>
              </div>
            ))}
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
