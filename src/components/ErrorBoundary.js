import React from "react";
import PropTypes from "prop-types";
import "./ErrorBoundary.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to your error reporting service
    console.error("Error caught by boundary:", error, errorInfo);

    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Optional: Send error to your analytics service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isRecoverable = this.state.errorCount < 3;

      return (
        <div className="error-boundary">
          <div className="error-content">
            <h1>Something went wrong</h1>
            <div className="error-details">
              <p>
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
              {this.props.showDetails && (
                <details>
                  <summary>Technical Details</summary>
                  <pre>{this.state.errorInfo?.componentStack}</pre>
                </details>
              )}
            </div>
            <div className="error-actions">
              {isRecoverable && (
                <button onClick={this.handleRetry} className="retry-button">
                  Try Again
                </button>
              )}
              <button onClick={this.handleRefresh} className="refresh-button">
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  showDetails: PropTypes.bool,
  onError: PropTypes.func,
};

ErrorBoundary.defaultProps = {
  showDetails: false,
};

export default ErrorBoundary;
