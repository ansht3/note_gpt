import React from "react";
import PropTypes from "prop-types";
import "./LoadingSpinner.css";

function LoadingSpinner({
  size = "medium",
  color = "primary",
  text = "Loading...",
  fullScreen = false,
  overlay = false,
  showText = true,
  spinnerType = "circular",
}) {
  const spinnerClasses = [
    "spinner-container",
    `spinner-${size}`,
    `spinner-${color}`,
    fullScreen && "spinner-fullscreen",
    overlay && "spinner-overlay",
    `spinner-type-${spinnerType}`,
  ]
    .filter(Boolean)
    .join(" ");

  const renderSpinner = () => {
    switch (spinnerType) {
      case "dots":
        return (
          <div className="dots-spinner">
            <div></div>
            <div></div>
            <div></div>
          </div>
        );
      case "pulse":
        return (
          <div className="pulse-spinner">
            <div className="pulse-dot"></div>
          </div>
        );
      case "wave":
        return (
          <div className="wave-spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        );
      default:
        return <div className="circular-spinner"></div>;
    }
  };

  return (
    <div className={spinnerClasses} role="status" aria-live="polite">
      <div className="spinner-content">
        {renderSpinner()}
        {showText && (
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
  spinnerType: PropTypes.oneOf(["circular", "dots", "pulse", "wave"]),
};

export default LoadingSpinner;
