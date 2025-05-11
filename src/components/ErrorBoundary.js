import React from "react";
import { FaExclamationTriangle, FaRedo, FaHome } from "react-icons/fa";
import "./ErrorBoundary.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      lastErrorTime: null,
      errorHistory: [],
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to error reporting service
    this.logError(error, errorInfo);

    // Update state with error details
    this.setState((prevState) => ({
      error,
      errorInfo,
      lastErrorTime: new Date(),
      errorHistory: [
        ...prevState.errorHistory,
        {
          error,
          errorInfo,
          timestamp: new Date(),
        },
      ].slice(-5), // Keep last 5 errors
    }));
  }

  logError = (error, errorInfo) => {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error);
      console.error("Error info:", errorInfo);
    }

    // Here you would typically send to your error reporting service
    // Example: Sentry.captureException(error);
  };

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorHistory: [],
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  renderErrorDetails = () => {
    const { error, errorInfo, errorHistory } = this.state;

    if (process.env.NODE_ENV !== "development") {
      return null;
    }

    return (
      <div className="error-details">
        <h3>Error Details (Development Only)</h3>
        <div className="error-stack">
          <h4>Error Message:</h4>
          <pre>{error?.toString()}</pre>

          <h4>Component Stack:</h4>
          <pre>{errorInfo?.componentStack}</pre>
        </div>

        {errorHistory.length > 0 && (
          <div className="error-history">
            <h4>Recent Errors:</h4>
            <ul>
              {errorHistory.map((err, index) => (
                <li key={index}>
                  <span className="error-time">
                    {err.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="error-message">{err.error.toString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <FaExclamationTriangle className="error-icon" />
            <h1>Something went wrong</h1>
            <p>
              We apologize for the inconvenience. Please try one of the
              following:
            </p>

            <div className="error-actions">
              <button
                className="retry-button"
                onClick={this.handleRetry}
                disabled={this.state.retryCount >= 3}
              >
                <FaRedo />
                {this.state.retryCount >= 3
                  ? "Max retries reached"
                  : "Try Again"}
              </button>

              <button className="reset-button" onClick={this.handleReset}>
                Reset Application
              </button>

              <button className="home-button" onClick={this.handleGoHome}>
                <FaHome />
                Go to Home
              </button>
            </div>

            {this.state.retryCount > 0 && (
              <p className="retry-count">
                Retry attempt: {this.state.retryCount}/3
              </p>
            )}

            {this.renderErrorDetails()}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
