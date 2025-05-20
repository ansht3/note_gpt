import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  FaSpinner,
  FaCircleNotch,
  FaCog,
  FaSync,
  FaPause,
  FaPlay,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import "./LoadingSpinner.css";

const SPINNER_TYPES = {
  default: FaSpinner,
  circle: FaCircleNotch,
  cog: FaCog,
  sync: FaSync,
};

const STATUS_TYPES = {
  loading: "loading",
  success: "success",
  error: "error",
  paused: "paused",
  info: "info",
};

function LoadingSpinner({
  size = "medium",
  text = "Loading...",
  spinnerType = "default",
  onPause,
  onResume,
  status = "loading",
  progress,
  showProgress = true,
  showControls = true,
  showStatus = true,
  className = "",
  ariaLabel = "Loading indicator",
}) {
  const [localProgress, setLocalProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Handle progress updates
  useEffect(() => {
    if (progress !== undefined) {
      setLocalProgress(progress);
    } else if (status === "loading" && !isPaused) {
      const interval = setInterval(() => {
        setLocalProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + 1;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [progress, status, isPaused]);

  // Handle pause/resume
  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const newState = !prev;
      if (newState) {
        onPause?.();
      } else {
        onResume?.();
      }
      return newState;
    });
  }, [onPause, onResume]);

  // Get spinner icon based on type
  const SpinnerIcon = SPINNER_TYPES[spinnerType] || SPINNER_TYPES.default;

  // Get status icon and color
  const getStatusInfo = () => {
    switch (status) {
      case "success":
        return {
          icon: <FaCheck />,
          color: "var(--success-color)",
          message: "Completed successfully",
        };
      case "error":
        return {
          icon: <FaTimes />,
          color: "var(--error-color)",
          message: "An error occurred",
        };
      case "paused":
        return {
          icon: <FaPause />,
          color: "var(--warning-color)",
          message: "Paused",
        };
      case "info":
        return {
          icon: <FaInfoCircle />,
          color: "var(--info-color)",
          message: text,
        };
      default:
        return {
          icon: <SpinnerIcon />,
          color: "var(--primary-color)",
          message: text,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      className={`loading-spinner ${size} ${status} ${className}`}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div className="spinner-container">
        <div
          className={`spinner-icon ${isPaused ? "paused" : ""}`}
          style={{ color: statusInfo.color }}
        >
          {statusInfo.icon}
        </div>

        {showStatus && (
          <div className="spinner-status">
            <span className="status-text">{statusInfo.message}</span>
            {showDetails && (
              <div className="status-details">
                <p>Progress: {Math.round(localProgress)}%</p>
                <p>Status: {status}</p>
                {status === "error" && (
                  <p className="error-message">
                    <FaExclamationTriangle /> Please try again
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {showProgress && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${localProgress}%`,
                  backgroundColor: statusInfo.color,
                }}
              />
            </div>
            <span className="progress-text">{Math.round(localProgress)}%</span>
          </div>
        )}

        {showControls && status === "loading" && (
          <div className="spinner-controls">
            <button
              className="control-button"
              onClick={togglePause}
              aria-label={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <FaPlay /> : <FaPause />}
            </button>
            <button
              className="control-button"
              onClick={() => setShowDetails(!showDetails)}
              aria-label={showDetails ? "Hide details" : "Show details"}
            >
              <FaInfoCircle />
            </button>
          </div>
        )}
      </div>

      {status === "error" && (
        <div className="error-container" role="alert">
          <FaExclamationTriangle className="error-icon" />
          <p className="error-message">
            Something went wrong. Please try again.
          </p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
            aria-label="Retry"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  text: PropTypes.string,
  spinnerType: PropTypes.oneOf(["default", "circle", "cog", "sync"]),
  onPause: PropTypes.func,
  onResume: PropTypes.func,
  status: PropTypes.oneOf(["loading", "success", "error", "paused", "info"]),
  progress: PropTypes.number,
  showProgress: PropTypes.bool,
  showControls: PropTypes.bool,
  showStatus: PropTypes.bool,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default LoadingSpinner;
