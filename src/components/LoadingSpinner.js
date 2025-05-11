import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  FaSpinner,
  FaCircleNotch,
  FaSyncAlt,
  FaCompactDisc,
  FaRegClock,
  FaPause,
  FaPlay,
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
}) {
  const [isPaused, setIsPaused] = useState(false);

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
            <div
              className="progress-bar"
              style={{ width: `${progress || 0}%` }}
            />
            {progress !== null && (
              <span className="progress-text">{`${Math.round(
                progress
              )}%`}</span>
            )}
          </div>
        );
      default:
        return <div className="circular-spinner">{renderIcon()}</div>;
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
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
        <button onClick={togglePause} className="pause-button">
          {isPaused ? <FaPlay /> : <FaPause />}
        </button>
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
};

export default LoadingSpinner;
