import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
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

// Memoized Spinner Icon Component
const SpinnerIcon = memo(({ type, isPaused, color }) => {
  const Icon = SPINNER_TYPES[type] || SPINNER_TYPES.default;
  return (
    <div
      className={`spinner-icon ${isPaused ? "paused" : ""}`}
      style={{ color }}
    >
      <Icon />
    </div>
  );
});

SpinnerIcon.propTypes = {
  type: PropTypes.string.isRequired,
  isPaused: PropTypes.bool.isRequired,
  color: PropTypes.string.isRequired,
};

// Memoized Progress Bar Component
const ProgressBar = memo(({ progress, color }) => (
  <div className="progress-container">
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{
          width: `${progress}%`,
          backgroundColor: color,
        }}
      />
    </div>
    <span className="progress-text">{Math.round(progress)}%</span>
  </div>
));

ProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

// Memoized Controls Component
const SpinnerControls = memo(
  ({ isPaused, onTogglePause, showDetails, onToggleDetails }) => (
    <div className="spinner-controls">
      <button
        className="control-button"
        onClick={onTogglePause}
        aria-label={isPaused ? "Resume" : "Pause"}
      >
        {isPaused ? <FaPlay /> : <FaPause />}
      </button>
      <button
        className="control-button"
        onClick={onToggleDetails}
        aria-label={showDetails ? "Hide details" : "Show details"}
      >
        <FaInfoCircle />
      </button>
    </div>
  )
);

SpinnerControls.propTypes = {
  isPaused: PropTypes.bool.isRequired,
  onTogglePause: PropTypes.func.isRequired,
  showDetails: PropTypes.bool.isRequired,
  onToggleDetails: PropTypes.func.isRequired,
};

// Memoized Error Component
const ErrorDisplay = memo(({ onRetry }) => (
  <div className="error-container" role="alert">
    <FaExclamationTriangle className="error-icon" />
    <p className="error-message">Something went wrong. Please try again.</p>
    <button className="retry-button" onClick={onRetry} aria-label="Retry">
      Retry
    </button>
  </div>
));

ErrorDisplay.propTypes = {
  onRetry: PropTypes.func.isRequired,
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

  // Memoize status info to prevent unnecessary recalculations
  const statusInfo = useMemo(() => {
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
          icon: (
            <SpinnerIcon
              type={spinnerType}
              isPaused={isPaused}
              color="var(--primary-color)"
            />
          ),
          color: "var(--primary-color)",
          message: text,
        };
    }
  }, [status, text, spinnerType, isPaused]);

  // Optimize progress updates with useCallback
  const updateProgress = useCallback(() => {
    setLocalProgress((prev) => (prev >= 100 ? 0 : prev + 1));
  }, []);

  // Handle progress updates with optimized interval
  useEffect(() => {
    if (progress !== undefined) {
      setLocalProgress(progress);
    } else if (status === "loading" && !isPaused) {
      const interval = setInterval(updateProgress, 100);
      return () => clearInterval(interval);
    }
  }, [progress, status, isPaused, updateProgress]);

  // Optimize pause/resume handlers
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

  const toggleDetails = useCallback(() => {
    setShowDetails((prev) => !prev);
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // Memoize class names
  const containerClassName = useMemo(
    () => `loading-spinner ${size} ${status} ${className}`.trim(),
    [size, status, className]
  );

  return (
    <div
      className={containerClassName}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div className="spinner-container">
        <SpinnerIcon
          type={spinnerType}
          isPaused={isPaused}
          color={statusInfo.color}
        />

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
          <ProgressBar progress={localProgress} color={statusInfo.color} />
        )}

        {showControls && status === "loading" && (
          <SpinnerControls
            isPaused={isPaused}
            onTogglePause={togglePause}
            showDetails={showDetails}
            onToggleDetails={toggleDetails}
          />
        )}
      </div>

      {status === "error" && <ErrorDisplay onRetry={handleRetry} />}
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

export default memo(LoadingSpinner);
