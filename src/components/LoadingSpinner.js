import React from "react";
import PropTypes from "prop-types";
import {
  FaSpinner,
  FaCircleNotch,
  FaSyncAlt,
  FaCompactDisc,
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
}) {
  const spinnerClasses = [
    "spinner-container",
    `spinner-${size}`,
    `spinner-${color}`,
    `spinner-speed-${speed}`,
    `text-${textPosition}`,
    fullScreen && "spinner-fullscreen",
    overlay && "spinner-overlay",
    `spinner-type-${spinnerType}`,
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
            {renderIcon()}
          </div>
        );
      case "wave":
        return (
          <div className="wave-spinner">
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
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
      default:
        return <div className="circular-spinner">{renderIcon()}</div>;
    }
  };

  return (
    <div className={spinnerClasses} role="status" aria-live="polite">
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
  spinnerType: PropTypes.oneOf(["circular", "dots", "pulse", "wave", "bounce"]),
  icon: PropTypes.oneOf(["default", "notch", "sync", "disc"]),
  speed: PropTypes.oneOf(["slow", "normal", "fast"]),
  textPosition: PropTypes.oneOf(["top", "bottom"]),
};

export default LoadingSpinner;
