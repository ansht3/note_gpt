import axios from "axios";
import { ApiError } from "../utils/errors";
import { logger } from "../utils/logger";
import { parseISO, formatDuration } from "date-fns";

class YouTubeService {
  constructor() {
    this.apiClient = axios.create({
      baseURL:
        process.env.YOUTUBE_API_BASE_URL ||
        "https://www.googleapis.com/youtube/v3",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.cache = new Map();
    this.rateLimiter = {
      requests: 0,
      lastReset: Date.now(),
      maxRequests: 10000, // YouTube API quota per day
      resetInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    };

    // Add response interceptor for rate limiting
    this.apiClient.interceptors.response.use(
      (response) => {
        this.rateLimiter.requests++;
        return response;
      },
      (error) => {
        if (error.response?.status === 429) {
          throw new ApiError(
            "Rate limit exceeded. Please try again later.",
            429
          );
        }
        throw error;
      }
    );
  }

  async checkRateLimit() {
    const now = Date.now();
    if (now - this.rateLimiter.lastReset >= this.rateLimiter.resetInterval) {
      this.rateLimiter.requests = 0;
      this.rateLimiter.lastReset = now;
    }

    if (this.rateLimiter.requests >= this.rateLimiter.maxRequests) {
      throw new ApiError("Daily API quota exceeded", 429);
    }
  }

  async getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 3600000) {
      // 1 hour cache
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  async getVideoInfo(videoId) {
    try {
      await this.checkRateLimit();

      // Check cache first
      const cacheKey = `video_${videoId}`;
      const cachedData = await this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const response = await this.apiClient.get("/videos", {
        params: {
          part: "snippet,contentDetails,statistics",
          id: videoId,
          key: this.apiKey,
        },
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new ApiError("Video not found", 404);
      }

      const videoData = response.data.items[0];
      const { snippet, contentDetails, statistics } = videoData;

      const result = {
        id: videoId,
        title: snippet.title,
        description: snippet.description,
        author: snippet.channelTitle,
        thumbnailUrl:
          snippet.thumbnails.maxres?.url || snippet.thumbnails.high.url,
        publishDate: parseISO(snippet.publishedAt),
        duration: this.formatDuration(contentDetails.duration),
        views: parseInt(statistics.viewCount, 10),
        likes: parseInt(statistics.likeCount, 10),
        hasTranscript: await this.checkTranscriptAvailability(videoId),
        availableLanguages: await this.getAvailableTranscriptLanguages(videoId),
        tags: snippet.tags || [],
        categoryId: snippet.categoryId,
        channelId: snippet.channelId,
        channelUrl: `https://www.youtube.com/channel/${snippet.channelId}`,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      };

      // Cache the result
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      logger.error("Error fetching video info:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.response?.data?.error?.message || "Failed to fetch video info",
        error.response?.status || 500
      );
    }
  }

  async getTranscript(videoId, languageCode = "en") {
    try {
      await this.checkRateLimit();

      // Check cache first
      const cacheKey = `transcript_${videoId}_${languageCode}`;
      const cachedData = await this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const response = await this.apiClient.get("/captions", {
        params: {
          part: "snippet",
          videoId: videoId,
          key: this.apiKey,
        },
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new ApiError("No captions found for this video", 404);
      }

      const caption = response.data.items.find(
        (item) => item.snippet.language === languageCode
      );

      if (!caption) {
        throw new ApiError(`No captions available in ${languageCode}`, 404);
      }

      const transcriptResponse = await this.apiClient.get(
        `/captions/${caption.id}`,
        {
          params: {
            tfmt: "srt",
            key: this.apiKey,
          },
        }
      );

      const result = {
        transcript: this.parseSrtTranscript(transcriptResponse.data),
        language: languageCode,
        isAutoGenerated: caption.snippet.trackKind === "ASR",
        segments: this.parseSrtSegments(transcriptResponse.data),
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      logger.error("Error fetching transcript:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.response?.data?.error?.message || "Failed to fetch transcript",
        error.response?.status || 500
      );
    }
  }

  async checkTranscriptAvailability(videoId) {
    try {
      await this.checkRateLimit();

      // Check cache first
      const cacheKey = `transcript_available_${videoId}`;
      const cachedData = await this.getFromCache(cacheKey);
      if (cachedData !== null) return cachedData;

      const response = await this.apiClient.get("/captions", {
        params: {
          part: "snippet",
          videoId: videoId,
          key: this.apiKey,
        },
      });

      const result = response.data.items && response.data.items.length > 0;
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      logger.error("Error checking transcript availability:", error);
      return false;
    }
  }

  async getAvailableTranscriptLanguages(videoId) {
    try {
      await this.checkRateLimit();

      // Check cache first
      const cacheKey = `languages_${videoId}`;
      const cachedData = await this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const response = await this.apiClient.get("/captions", {
        params: {
          part: "snippet",
          videoId: videoId,
          key: this.apiKey,
        },
      });

      if (!response.data.items) return [];

      const result = response.data.items.map((item) => ({
        code: item.snippet.language,
        name: this.getLanguageName(item.snippet.language),
        isAutoGenerated: item.snippet.trackKind === "ASR",
      }));

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      logger.error("Error fetching available languages:", error);
      return [];
    }
  }

  formatDuration(isoDuration) {
    try {
      const duration = formatDuration(isoDuration);
      return duration.replace("PT", "").toLowerCase();
    } catch (error) {
      logger.error("Error formatting duration:", error);
      return "unknown";
    }
  }

  parseSrtTranscript(srtContent) {
    try {
      const segments = srtContent.trim().split("\n\n");
      let transcript = "";

      segments.forEach((segment) => {
        const lines = segment.split("\n");
        if (lines.length >= 3) {
          transcript += lines.slice(2).join(" ") + " ";
        }
      });

      return transcript.trim();
    } catch (error) {
      logger.error("Error parsing SRT transcript:", error);
      throw new ApiError("Failed to parse transcript", 500);
    }
  }

  parseSrtSegments(srtContent) {
    try {
      const segments = srtContent.trim().split("\n\n");
      return segments
        .map((segment) => {
          const lines = segment.split("\n");
          if (lines.length >= 3) {
            const [index, timeRange, ...textLines] = lines;
            const [startTime, endTime] = timeRange.split(" --> ");
            return {
              index: parseInt(index, 10),
              startTime: this.parseSrtTime(startTime),
              endTime: this.parseSrtTime(endTime),
              text: textLines.join(" "),
            };
          }
          return null;
        })
        .filter(Boolean);
    } catch (error) {
      logger.error("Error parsing SRT segments:", error);
      return [];
    }
  }

  parseSrtTime(timeString) {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }

  getLanguageName(languageCode) {
    const languages = new Intl.DisplayNames(["en"], { type: "language" });
    try {
      return languages.of(languageCode);
    } catch (error) {
      return languageCode;
    }
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const youtubeService = new YouTubeService();
