import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";

function TranscriptPage() {
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const videoUrl = params.get("url");

        const response = await fetch(
          `/api/transcript?url=${encodeURIComponent(videoUrl)}`
        );
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        setTranscript(data.transcript);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranscript();
  }, [location]);

  const handleGenerateSummary = () => {
    history.push("/summary", { transcript });
  };

  const handleAskQuestions = () => {
    history.push("/ask-questions", { transcript });
  };

  if (isLoading) return <div>Loading transcript...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="transcript-container">
      <h2>Video Transcript</h2>
      <div className="action-buttons">
        <button onClick={handleGenerateSummary}>Generate Summary</button>
        <button onClick={handleAskQuestions}>Ask Questions</button>
      </div>
      <div className="transcript-content">
        {transcript.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

export default TranscriptPage;
