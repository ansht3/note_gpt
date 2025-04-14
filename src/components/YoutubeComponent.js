import React, { Component } from "react";
import axios from "axios";

class YoutubeComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: "",
      loading: false,
      error: null,
    };

    // Bind methods to this
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  // Add error handling method
  handleError(error) {
    this.setState({
      loading: false,
      error:
        error.response?.data?.message || error.message || "An error occurred",
    });
    console.error("API error:", error);
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.setState({ loading: true, error: null });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/videos/transcript",
        {
          url: this.state.url,
        }
      );

      this.setState({
        loading: false,
      });
      // Handle successful response
    } catch (error) {
      this.handleError(error);
    }
  }

  handleChange(e) {
    this.setState({ url: e.target.value });
  }

  render() {
    const { url, loading, error } = this.state;

    return (
      <div className="youtube-component">
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            value={url}
            onChange={this.handleChange}
            placeholder="Enter YouTube URL"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Submit"}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    );
  }
}

export default YoutubeComponent;
