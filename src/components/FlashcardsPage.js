import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const generateFlashcards = async () => {
      try {
        const response = await fetch("/api/generate-flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: location.state?.transcript,
          }),
        });

        const data = await response.json();
        setFlashcards(data.flashcards);
      } catch (error) {
        console.error("Error generating flashcards:", error);
      } finally {
        setIsLoading(false);
      }
    };

    generateFlashcards();
  }, [location]);

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) =>
      prev === flashcards.length - 1 ? 0 : prev + 1
    );
  };

  const handlePreviousCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) =>
      prev === 0 ? flashcards.length - 1 : prev - 1
    );
  };

  if (isLoading) return <div>Generating flashcards...</div>;
  if (!flashcards.length) return <div>No flashcards available</div>;

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="flashcards-container">
      <h2>Study Flashcards</h2>

      <div className="progress-indicator">
        Card {currentCardIndex + 1} of {flashcards.length}
      </div>

      <div
        className={`flashcard ${isFlipped ? "flipped" : ""}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <p>{currentCard.question}</p>
          </div>
          <div className="flashcard-back">
            <p>{currentCard.answer}</p>
          </div>
        </div>
      </div>

      <div className="navigation-buttons">
        <button onClick={handlePreviousCard}>Previous</button>
        <button onClick={() => setIsFlipped(!isFlipped)}>
          {isFlipped ? "Show Question" : "Show Answer"}
        </button>
        <button onClick={handleNextCard}>Next</button>
      </div>

      <div className="study-progress">
        <div
          className="progress-bar"
          style={{
            width: `${((currentCardIndex + 1) / flashcards.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

export default FlashcardsPage;
