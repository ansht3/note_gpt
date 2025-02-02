import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function AskQuestionsPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Get transcript from location state or fetch it
    if (location.state?.transcript) {
      setTranscript(location.state.transcript);
    }
  }, [location]);

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/ask-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          transcript,
        }),
      });

      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error("Error asking question:", error);
      setAnswer("Sorry, there was an error processing your question.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="questions-container">
      <h2>Ask Questions About the Video</h2>
      <form onSubmit={handleQuestionSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the video content..."
          className="question-input"
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="submit-btn"
        >
          {isLoading ? "Processing..." : "Ask Question"}
        </button>
      </form>

      {answer && (
        <div className="answer-container">
          <h3>Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default AskQuestionsPage;
