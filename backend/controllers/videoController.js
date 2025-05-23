const axios = require("axios");
const youtubeTranscript = require("youtube-transcript-api"); // Get YouTube transcript
const { getTranscript } = require("youtube-transcript");
const { AIService } = require("../services/aiService");
const { YouTubeService } = require("../services/youtubeService");
const { ApiError } = require("../utils/errors");
const { logger } = require("../utils/logger");
const { cache } = require("../utils/cache");

const youtubeService = new YouTubeService();
const aiService = new AIService();

const getTranscript = async (videoUrl) => {
  const videoId = extractVideoId(videoUrl); // Function to extract video ID from URL
  const transcript = await youtubeTranscript.fetchTranscript(videoId);
  return transcript;
};

// API endpoint to get transcript
exports.getVideoData = async (req, res) => {
  const videoUrl = req.params.url;
  try {
    const transcript = await getTranscript(videoUrl);
    res.status(200).json({ transcript });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transcript" });
  }
};

class VideoController {
  constructor() {
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }

  async validateVideo(req, res, next) {
    try {
      const { url } = req.query;

      if (!url) {
        throw new ApiError("Video URL is required", 400);
      }

      const videoId = youtubeService.extractVideoId(url);
      if (!videoId) {
        throw new ApiError("Invalid YouTube URL", 400);
      }

      // Check cache first
      const cacheKey = `validation:${videoId}`;
      const cachedValidation = await cache.get(cacheKey);
      if (cachedValidation) {
        return res.json(cachedValidation);
      }

      // Validate video exists and is accessible
      const videoInfo = await youtubeService.getVideoInfo(videoId);
      const hasTranscript = await youtubeService.checkTranscriptAvailability(
        videoId
      );

      const validation = {
        valid: true,
        videoId,
        hasTranscript,
        duration: videoInfo.duration,
        isAccessible: true,
      };

      // Cache validation result
      await cache.set(cacheKey, validation, 3600); // Cache for 1 hour

      res.json(validation);
    } catch (error) {
      logger.error("Error in validateVideo:", error);
      next(error);
    }
  }

  async getVideoMetadata(req, res, next) {
    try {
      const { url } = req.query;

      if (!url) {
        throw new ApiError("Video URL is required", 400);
      }

      const videoId = youtubeService.extractVideoId(url);
      if (!videoId) {
        throw new ApiError("Invalid YouTube URL", 400);
      }

      // Check cache
      const cacheKey = `m etadata:${videoId}`;
      const cachedMetadata = await cache.get(cacheKey);
      if (cachedMetadata) {
        return res.json(cachedMetadata);
      }
      const definition = await youtubeService.getVideoDefinition(videoId);
      const transcript = await youtubeService.getTranscript(videoId);

      const videoInfo = await youtubeService.getVideoInfo(videoId);
      const hasTranscript = await youtubeService.checkTranscriptAvailability(
        videoId
      );
      const availableLanguages =
        await youtubeService.getAvailableTranscriptLanguages(videoId);

      const metadata = {
        id: videoId,
        title: videoInfo.title,
        author: videoInfo.author,
        duration: videoInfo.duration,
        thumbnail: videoInfo.thumbnail,
        description: videoInfo.description,
        publishDate: videoInfo.publishDate,
        views: videoInfo.views,
        hasTranscript,
        availableLanguages,
      };

      await cache.set(cacheKey, metadata, this.cacheTimeout);

      res.json(metadata);
    } catch (error) {
      logger.error("Error in getVideoMetadata:", error);
      next(error);
    }
  }

  async getVideoTranscript(req, res, next) {
    try {
      const { url } = req.query;

      if (!url) {
        throw new ApiError("Video URL is required", 400);
      }

      const videoId = youtubeService.extractVideoId(url);
      if (!videoId) {
        throw new ApiError("Invalid YouTube URL", 400);
      }

      // Check cache
      const cacheKey = `transcript:${videoId}`;
      const cachedTranscript = await cache.get(cacheKey);
      if (cachedTranscript) {
        return res.json(cachedTranscript);
      }

      // Get video info and transcript
      const [videoInfo, transcript] = await Promise.all([
        youtubeService.getVideoInfo(videoId),
        youtubeService.getTranscript(videoId),
      ]);

      if (!transcript) {
        throw new ApiError("No transcript available for this video", 404);
      }

      const response = {
        videoInfo: {
          id: videoId,
          title: videoInfo.title,
          author: videoInfo.author,
          duration: videoInfo.duration,
          thumbnail: videoInfo.thumbnail,
          description: videoInfo.description,
          publishDate: videoInfo.publishDate,
          views: videoInfo.views,
        },
        transcript: transcript.text,
        language: transcript.language,
        isAutoGenerated: transcript.isAutoGenerated,
      };

      // Cache transcript
      await cache.set(cacheKey, response, this.cacheTimeout);

      res.json(response);
    } catch (error) {
      logger.error("Error in getVideoTranscript:", error);
      next(error);
    }
  }

  async generateSummary(req, res, next) {
    try {
      const { transcript } = req.body;

      if (!transcript) {
        throw new ApiError("Transcript is required", 400);
      }

      const summary = await aiService.generateSummary(transcript);

      res.json({
        success: true,
        summary,
      });
    } catch (error) {
      logger.error("Error in generateSummary:", error);
      next(error);
    }
  }

  async generateFlashcards(req, res, next) {
    try {
      const { transcript } = req.body;

      if (!transcript) {
        throw new ApiError("Transcript is required", 400);
      }

      const flashcards = await aiService.generateFlashcards(transcript);

      res.json({
        success: true,
        flashcards,
      });
    } catch (error) {
      logger.error("Error in generateFlashcards:", error);
      next(error);
    }
  }

  async generateSlides(req, res, next) {
    try {
      const { transcript, options } = req.body;

      if (!transcript) {
        throw new ApiError("Transcript is required", 400);
      }

      const slides = await aiService.generateSlides(transcript, options);

      res.json({
        success: true,
        slides,
      });
    } catch (error) {
      logger.error("Error in generateSlides:", error);
      next(error);
    }
  }

  async askQuestion(req, res) {
    try {
      const { question, transcript } = req.body;
      const answer = await aiService.generateAnswer(question, transcript);

      res.json({
        success: true,
        answer,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to generate answer",
      });
    }
  }
}

function extractVideoId(url) {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}

module.exports = new VideoController();
