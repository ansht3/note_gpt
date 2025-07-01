import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  FaArrowLeft,
  FaRegCopy,
  FaDownload,
  FaRegEdit,
  FaRegSave,
  FaCog,
  FaCheck,
  FaShare,
  FaBookmark,
  FaRegBookmark,
  FaBookmark as FaBookmarkSolid,
  FaExpand,
  FaCompress,
  FaPrint,
} from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";
import ErrorBoundary from "./ErrorBoundary";
import api from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import "./SummaryPage.css";

function SummaryPage() {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: "medium",
    lineSpacing: "normal",
    showBulletPoints: true,
    highlightKeywords: true,
    autoTranslate: false,
    darkMode: false,
  });
  const [copySuccess, setCopySuccess] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [translationProgress, setTranslationProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const location = useLocation();
  const history = useHistory();
  const { currentLanguage, t } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    generateSummary();
  }, [location.state]);

  const generateSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        text,
        videoInfo: info,
        settings: userSettings,
      } = location.state || {};

      if (!text) {
        throw new Error(t("errors.noTranscript"));
      }

      setVideoInfo(info);
      if (userSettings) {
        setSettings((prev) => ({ ...prev, ...userSettings }));
      }

      const response = await api.ai.generateSummary(text);
      setSummary(response.summary);
      setEditedSummary(response.summary);

      // Check if summary is bookmarked
      const bookmarkedSummaries = JSON.parse(
        localStorage.getItem("bookmarkedSummaries") || "[]"
      );
      setIsBookmarked(bookmarkedSummaries.includes(info?.title));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedSummary);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError(t("errors.copyFailed"));
    }
  };

  const handleNewCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedSummary);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([editedSummary], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `summary-${videoInfo?.title || "video"}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(t("errors.downloadFailed"));
    }
  };

  const handleSaveEdit = () => {
    setSummary(editedSummary);
    setIsEditing(false);
    // Save to history
    const history = JSON.parse(localStorage.getItem("summaryHistory") || "[]");
    history.unshift({
      id: Date.now(),
      title: videoInfo?.title,
      content: editedSummary,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(
      "summaryHistory",
      JSON.stringify(history.slice(0, 50))
    );
  };

  const handleSettingsChange = (newSettings) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  const toggleBookmark = () => {
    const bookmarkedSummaries = JSON.parse(
      localStorage.getItem("bookmarkedSummaries") || "[]"
    );
    if (isBookmarked) {
      const newBookmarks = bookmarkedSummaries.filter(
        (title) => title !== videoInfo?.title
      );
      localStorage.setItem("bookmarkedSummaries", JSON.stringify(newBookmarks));
    } else {
      bookmarkedSummaries.push(videoInfo?.title);
      localStorage.setItem(
        "bookmarkedSummaries",
        JSON.stringify(bookmarkedSummaries)
      );
    }
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: videoInfo?.title,
          text: `Check out this summary: ${videoInfo?.title}`,
          url: window.location.href,
        });
      } else {
        setShowShareModal(true);
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isLoading) {
    return (
      <LoadingSpinner
        text={t("loading.generatingSummary")}
        size="large"
        spinnerType="wave"
      />
    );
  }

  return (
    <ErrorBoundary>
      <div
        className={`summary-page ${isDarkMode ? "dark-mode" : ""} ${
          isFullscreen ? "fullscreen" : ""
        }`}
      >
        <div className="summary-header">
          <div className="header-left">
            <button
              className="back-button"
              onClick={() => history.goBack()}
              title={t("actions.goBack")}
            >
              <FaArrowLeft /> {t("actions.back")}
            </button>

            {videoInfo && (
              <div className="video-info">
                <h1>{videoInfo.title}</h1>
                <p className="video-metadata">
                  {videoInfo.author} • {videoInfo.duration}
                </p>
              </div>
            )}
          </div>

          <div className="summary-actions">
            <button
              className="action-button"
              onClick={() => setIsEditing(!isEditing)}
              title={
                isEditing ? t("actions.saveChanges") : t("actions.editSummary")
              }
            >
              {isEditing ? <FaRegSave /> : <FaRegEdit />}
              {isEditing ? t("actions.save") : t("actions.edit")}
            </button>
            <button
              className={`action-button ${copySuccess ? "success" : ""}`}
              onClick={handleCopy}
              title={t("actions.copyToClipboard")}
            >
              {copySuccess ? <FaCheck /> : <FaRegCopy />}
              {copySuccess ? t("actions.copied") : t("actions.copy")}
            </button>
            <button
              className="action-button"
              onClick={handleDownload}
              title={t("actions.downloadSummary")}
            >
              <FaDownload />
              {t("actions.download")}
            </button>
            <button
              className="action-button"
              onClick={toggleBookmark}
              title={t("actions.bookmark")}
            >
              {isBookmarked ? <FaBookmarkSolid /> : <FaRegBookmark />}
              {t("actions.bookmark")}
            </button>
            <button
              className="action-button"
              onClick={handleShare}
              title={t("actions.share")}
            >
              <FaShare />
              {t("actions.share")}
            </button>
            <button
              className="action-button"
              onClick={handlePrint}
              title={t("actions.print")}
            >
              <FaPrint />
              {t("actions.print")}
            </button>
            <button
              className="action-button"
              onClick={toggleFullscreen}
              title={t("actions.toggleFullscreen")}
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
              {isFullscreen
                ? t("actions.exitFullscreen")
                : t("actions.fullscreen")}
            </button>
            <button
              className="action-button settings"
              onClick={() => setShowSettings(!showSettings)}
              title={t("actions.settings")}
            >
              <FaCog />
              {t("actions.settings")}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
            <button onClick={generateSummary} className="retry-button">
              {t("actions.retry")}
            </button>
          </div>
        )}

        <div className="summary-container">
          <div
            className={`summary-content ${settings.fontSize} ${settings.lineSpacing}`}
          >
            {isEditing ? (
              <textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                className="summary-editor"
                placeholder={t("placeholders.summaryContent")}
                spellCheck="true"
                aria-label={t("labels.editSummary")}
              />
            ) : (
              <div className="summary-text">
                {settings.showBulletPoints ? (
                  <ul>
                    {editedSummary.split("\n").map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  editedSummary
                    .split("\n")
                    .map((paragraph, index) => <p key={index}>{paragraph}</p>)
                )}
              </div>
            )}
          </div>
        </div>

        {showSettings && (
          <div className="settings-modal">
            <div className="settings-content">
              <h2>{t("settings.title")}</h2>
              <div className="settings-group">
                <h3>{t("settings.display")}</h3>
                <div className="setting-item">
                  <label>{t("settings.fontSize")}</label>
                  <select
                    value={settings.fontSize}
                    onChange={(e) =>
                      handleSettingsChange({ fontSize: e.target.value })
                    }
                  >
                    <option value="small">{t("settings.small")}</option>
                    <option value="medium">{t("settings.medium")}</option>
                    <option value="large">{t("settings.large")}</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>{t("settings.lineSpacing")}</label>
                  <select
                    value={settings.lineSpacing}
                    onChange={(e) =>
                      handleSettingsChange({ lineSpacing: e.target.value })
                    }
                  >
                    <option value="compact">{t("settings.compact")}</option>
                    <option value="normal">{t("settings.normal")}</option>
                    <option value="spacious">{t("settings.spacious")}</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.showBulletPoints}
                      onChange={(e) =>
                        handleSettingsChange({
                          showBulletPoints: e.target.checked,
                        })
                      }
                    />
                    {t("settings.showBulletPoints")}
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.highlightKeywords}
                      onChange={(e) =>
                        handleSettingsChange({
                          highlightKeywords: e.target.checked,
                        })
                      }
                    />
                    {t("settings.highlightKeywords")}
                  </label>
                </div>
              </div>
              <div className="settings-actions">
                <button
                  className="close-button"
                  onClick={() => setShowSettings(false)}
                >
                  {t("actions.close")}
                </button>
              </div>
            </div>
          </div>
        )}

        {showShareModal && (
          <div className="share-modal">
            <div className="share-content">
              <h2>{t("share.title")}</h2>
              <div className="share-options">
                <button onClick={() => handleShare("copy")}>
                  {t("share.copyLink")}
                </button>
                <button onClick={() => handleShare("email")}>
                  {t("share.email")}
                </button>
                <button onClick={() => handleShare("social")}>
                  {t("share.social")}
                </button>
              </div>
              <button
                className="close-button"
                onClick={() => setShowShareModal(false)}
              >
                {t("actions.close")}
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default SummaryPage;
