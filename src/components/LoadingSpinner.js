import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  FaSpinner,
  FaCircleNotch,
  FaSyncAlt,
  FaCompactDisc,
  FaRegClock,
  FaPause,
  FaPlay,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./LoadingSpinner.css";

function LoadingSpinner({
  size = "medium",
  color = "primary",
  text = "Loading...",
  fullScreen = false,
  overlay = false,
  showText = true,
  spinnerType = "circular",
  icon = "default",
  speed = "normal",
  textPosition = "bottom",
  progress = null,
  customClass = "",
  backgroundColor = "transparent",
  backgroundImage = "",
  status = null,
  onPause,
  onResume,
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (!isPaused && progress === null) {
      interval = setInterval(() => {
        setLocalProgress((prevProgress) => (prevProgress + 1) % 100);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPaused, progress]);

  const spinnerClasses = [
    "spinner-container",
    `spinner-${size}`,
    `spinner-${color}`,
    `spinner-speed-${speed}`,
    `text-${textPosition}`,
    fullScreen && "spinner-fullscreen",
    overlay && "spinner-overlay",
    `spinner-type-${spinnerType}`,
    customClass,
  ]
    .filter(Boolean)
    .join(" ");

  const togglePause = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    if (newPausedState && onPause) {
      onPause();
    } else if (!newPausedState && onResume) {
      onResume();
    }
  };

  const renderIcon = () => {
    switch (icon) {
      case "notch":
        return <FaCircleNotch className="spinner-icon" />;
      case "sync":
        return <FaSyncAlt className="spinner-icon" />;
      case "disc":
        return <FaCompactDisc className="spinner-icon" />;
      case "clock":
        return <FaRegClock className="spinner-icon" />;
      default:
        return <FaSpinner className="spinner-icon" />;
    }
  };

  const renderSpinner = () => {
    switch (spinnerType) {
      case "dots":
        return (
          <div className="dots-spinner">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );
      case "pulse":
        return (
          <div className="pulse-spinner">
            <div className="pulse-ring"></div>
          </div>
        );
      case "wave":
        return (
          <div className="wave-spinner">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="wave-bar"></div>
            ))}
          </div>
        );
      case "bounce":
        return (
          <div className="bounce-spinner">
            <div className="bounce-dot"></div>
            <div className="bounce-dot"></div>
            <div className="bounce-dot"></div>
          </div>
        );
      case "progress":
        return (
          <div className="progress-spinner">
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${progress || localProgress}%` }}
              />
              <div className="progress-text">
                {`${Math.round(progress || localProgress)}%`}
              </div>
            </div>
          </div>
        );
      default:
        return <div className="circular-spinner">{renderIcon()}</div>;
    }
  };

  const renderStatusMessage = () => {
    if (status === "success") {
      return (
        <div className="status-message success">
          <FaCheck /> Success!
        </div>
      );
    } else if (status === "error") {
      return (
        <div className="status-message error">
          <FaExclamationTriangle /> Error!
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={spinnerClasses}
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        backgroundColor: backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="spinner-content">
        {textPosition === "top" && showText && (
          <p className="spinner-text" aria-label={text}>
            {text}
          </p>
        )}
        {renderSpinner()}
        {textPosition === "bottom" && showText && (
          <p className="spinner-text" aria-label={text}>
            {text}
          </p>
        )}
        <button
          onClick={togglePause}
          className="pause-button"
          aria-label={isPaused ? "Resume loading" : "Pause loading"}
        >
          {isPaused ? <FaPlay /> : <FaPause />}
          {isPaused ? "Resume" : "Pause"}
        </button>
        {renderStatusMessage()}
      </div>
    </div>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  color: PropTypes.oneOf(["primary", "secondary", "accent", "white"]),
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
  overlay: PropTypes.bool,
  showText: PropTypes.bool,
  spinnerType: PropTypes.oneOf([
    "circular",
    "dots",
    "pulse",
    "wave",
    "bounce",
    "progress",
  ]),
  icon: PropTypes.oneOf(["default", "notch", "sync", "disc", "clock"]),
  speed: PropTypes.oneOf(["slow", "normal", "fast"]),
  textPosition: PropTypes.oneOf(["top", "bottom"]),
  progress: PropTypes.number,
  customClass: PropTypes.string,
  backgroundColor: PropTypes.string,
  backgroundImage: PropTypes.string,
  status: PropTypes.oneOf(["success", "error", null]),
  onPause: PropTypes.func,
  onResume: PropTypes.func,
};

export default LoadingSpinner;
