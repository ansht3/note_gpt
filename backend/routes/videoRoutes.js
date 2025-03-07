const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");

// Route to fetch video transcript
router.get("/transcript", videoController.getVideoTranscript);

// Route to generate flashcards
router.post("/generate-flashcards", videoController.generateFlashcards);

// Route to generate presentation slides
router.post("/generate-slides", videoController.generateSlides);

// Route to ask questions about the video
router.post("/ask-question", videoController.askQuestion);

module.exports = router;
