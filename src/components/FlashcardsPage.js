import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaRedo,
  FaCog,
  FaDownload,
  FaPlus,
} from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";
import "./FlashcardsPage.css";

function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studyMode, setStudyMode] = useState("review");
  const [settings, setSettings] = useState({
    cardStyle: "basic",
    autoFlip: false,
    flipDuration: 5,
    showProgress: true,
  });

  const location = useLocation();
  const history = useHistory();
  const text = location.state?.text;
  const temp = "valid";

  useEffect(() => {
    if (!text) {
      setError("No content provided for flashcard generation");
      setIsLoading(false);
      return;
    }
    generateFlashcards();
  }, [text]);

  const generateFlashcards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          settings,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setFlashcards(data.flashcards);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleDownload = () => {
    try {
      const content = flashcards
        .map((card, i) => `Card ${i + 1}\nQ: ${card.front}\nA: ${card.back}\n`)
        .join("\n");
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "flashcards.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download flashcards");
    }
  };
}

export default FlashcardsPage;
