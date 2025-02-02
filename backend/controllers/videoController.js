const axios = require("axios");
const youtubeTranscript = require("youtube-transcript-api"); // Get YouTube transcript
const { getTranscript } = require("youtube-transcript");
const { AIService } = require("../services/aiService");
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

const videoController = {
  async getVideoTranscript(req, res) {
    try {
      const { url } = req.query;
      const videoId = extractVideoId(url);

      if (!videoId) {
        return res.status(400).json({
          success: false,
          error: "Invalid YouTube URL",
        });
      }

      const transcript = await getTranscript(videoId);
      const formattedTranscript = transcript.map((item) => item.text).join(" ");

      res.json({
        success: true,
        transcript: formattedTranscript,
      });
    } catch (error) {
      console.error("Transcript error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch transcript",
      });
    }
  },

  async generateSummary(req, res) {
    try {
      const { transcript } = req.body;
      const summary = await aiService.generateSummary(transcript);

      res.json({
        success: true,
        summary,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to generate summary",
      });
    }
  },

  async generateFlashcards(req, res) {
    try {
      const { transcript } = req.body;
      const flashcards = await aiService.generateFlashcards(transcript);

      res.json({
        success: true,
        flashcards,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to generate flashcards",
      });
    }
  },

  async generateSlides(req, res) {
    try {
      const { transcript, options } = req.body;
      const slides = await aiService.generateSlides(transcript, options);

      res.json({
        success: true,
        slides,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to generate slides",
      });
    }
  },

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
  },
};

function extractVideoId(url) {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}

module.exports = videoController;
