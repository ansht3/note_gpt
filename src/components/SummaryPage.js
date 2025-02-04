import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

// Remove all interfaces and type definitions since this is a JavaScript file
// Keep only what's being used
const QuestionType = {
  TEXT: "text",
  MULTIPLE_CHOICE: "multiple_choice",
  CHECKBOX: "checkbox",
  NUMBER: "number",
  DATE: "date",
  RATING: "rating",
};

function SummaryPage() {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const generateSummary = async () => {
      try {
        const transcript = location.state?.transcript;
        if (!transcript) throw new Error("No transcript provided");

        const response = await fetch("/api/generate-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        setSummary(data.summary);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    generateSummary();
  }, [location]);

  if (isLoading) return <div>Generating summary...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="summary-container">
      <h2>Video Summary</h2>
      <button
        onClick={() => setShowTranscript(!showTranscript)}
        className="toggle-btn"
      >
        {showTranscript ? "Show Summary" : "Show Full Transcript"}
      </button>

      <div className="content-container">
        {showTranscript ? (
          <div className="transcript-view">
            <h3>Full Transcript</h3>
            <p>{location.state?.transcript}</p>
          </div>
        ) : (
          <div className="summary-view">
            <h3>Key Points</h3>
            <div className="summary-content">
              {summary.split("\n").map((point, index) => (
                <p key={index}>{point}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SummaryPage;
