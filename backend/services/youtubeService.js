const { google } = require("googleapis");
const youtube = google.youtube("v3");

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
  }

  async getVideoDetails(videoId) {
    try {
      const response = await youtube.videos.list({
        key: this.apiKey,
        part: "snippet,contentDetails",
        id: videoId,
      });

      if (response.data.items.length === 0) {
        throw new Error("Video not found");
      }

      return response.data.items[0];
    } catch (error) {
      console.error("Error fetching video details:", error);
      throw error;
    }
  }

  async getVideoTranscript(videoId) {
    try {
      const response = await youtube.captions.list({
        key: this.apiKey,
        part: "snippet",
        videoId: videoId,
      });

      // Note: Getting actual transcripts requires OAuth2 authentication
      // This is a simplified version
      return response.data.items;
    } catch (error) {
      console.error("Error fetching transcript:", error);
      throw error;
    }
  }

  extractVideoId(url) {
    const regExp =
      /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }
}

module.exports = new YouTubeService();
