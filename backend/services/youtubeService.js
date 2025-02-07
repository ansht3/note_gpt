import axios from "axios";
import ytdl from "ytdl-core";
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import { cache } from "../utils/cache";

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.ffmpeg = createFFmpeg({ log: false });
    this.cache = cache;

    if (!this.apiKey) {
      throw new Error("YouTube API key not found in environment variables");
    }
  }

  async getVideoInfo(url) {
    try {
      const videoId = this.extractVideoId(url);
      const cacheKey = `video_info_${videoId}`;

      // Check cache first
      const cachedInfo = await this.cache.get(cacheKey);
      if (cachedInfo) return cachedInfo;

      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos`,
        {
          params: {
            part: "snippet,contentDetails",
            id: videoId,
            key: this.apiKey,
          },
        }
      );

      const videoInfo = response.data.items[0];
      if (!videoInfo) throw new Error("Video not found");

      const result = {
        title: videoInfo.snippet.title,
        description: videoInfo.snippet.description,
        duration: videoInfo.contentDetails.duration,
        thumbnail: videoInfo.snippet.thumbnails.high.url,
      };

      // Cache the result
      await this.cache.set(cacheKey, result, 3600); // Cache for 1 hour
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch video info: ${error.message}`);
    }
  }

  async getTranscript(url) {
    try {
      const videoId = this.extractVideoId(url);
      const cacheKey = `transcript_${videoId}`;

      const cachedTranscript = await this.cache.get(cacheKey);
      if (cachedTranscript) return cachedTranscript;

      const info = await ytdl.getInfo(url);
      const tracks =
        info.player_response.captions?.playerCaptionsTracklistRenderer
          ?.captionTracks;

      if (!tracks || tracks.length === 0) {
        throw new Error("No captions available for this video");
      }

      const track = tracks[0]; // Get first available track
      const response = await axios.get(track.baseUrl);
      const transcript = this.parseTranscript(response.data);

      await this.cache.set(cacheKey, transcript, 86400); // Cache for 24 hours
      return transcript;
    } catch (error) {
      throw new Error(`Failed to fetch transcript: ${error.message}`);
    }
  }

  async downloadAudio(url) {
    try {
      const videoId = this.extractVideoId(url);
      const outputPath = `./temp/${videoId}.mp3`;

      await this.ffmpeg.load();

      const stream = ytdl(url, {
        quality: "highestaudio",
        filter: "audioonly",
      });

      const buffer = await this.streamToBuffer(stream);
      await this.ffmpeg.write("input.webm", buffer);

      await this.ffmpeg.run("-i", "input.webm", "-q:a", "0", outputPath);

      return outputPath;
    } catch (error) {
      throw new Error(`Failed to download audio: ${error.message}`);
    }
  }

  extractVideoId(url) {
    try {
      const videoId = ytdl.getVideoID(url);
      return videoId;
    } catch (error) {
      throw new Error("Invalid YouTube URL");
    }
  }

  parseTranscript(rawTranscript) {
    // Implement transcript parsing logic
    // Convert raw transcript to structured format
    return {
      segments: [],
      text: "",
    };
  }

  async streamToBuffer(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
    });
  }

  validateUrl(url) {
    return ytdl.validateURL(url);
  }
}

export default new YouTubeService();
