import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Packer } from "docx";
import { saveAs } from "file-saver";
import PptxGenJS from "pptxgenjs";

function PresentationPage() {
  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [presentationType, setPresentationType] = useState("pptx");
  const [customization, setCustomization] = useState({
    theme: "professional",
    includeImages: true,
    slidesPerTopic: 2,
  });
  const location = useLocation();

  useEffect(() => {
    const generateSlides = async () => {
      try {
        const response = await fetch("/api/generate-slides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: location.state?.transcript,
            options: customization,
          }),
        });

        const data = await response.json();
        setSlides(data.slides);
      } catch (error) {
        console.error("Error generating slides:", error);
      } finally {
        setIsLoading(false);
      }
    };

    generateSlides();
  }, [location, customization]);

  const handleExport = async () => {
    if (presentationType === "pptx") {
      const pptx = new PptxGenJS();

      slides.forEach((slide) => {
        const newSlide = pptx.addSlide();
        newSlide.addText(slide.title, { x: 1, y: 1, fontSize: 24 });
        newSlide.addText(slide.content, { x: 1, y: 2, fontSize: 18 });
      });

      pptx.writeFile("presentation.pptx");
    } else {
      // PDF export logic
      const blob = await generatePDF(slides);
      saveAs(blob, "presentation.pdf");
    }
  };

  const generatePDF = async (slides) => {
    try {
      // Implementation for PDF generation
      console.log("Generating PDF...", slides);
      // Add your PDF generation logic here
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  if (isLoading) return <div>Generating presentation...</div>;

  return (
    <div className="presentation-container">
      <h2>Presentation Generator</h2>

      <div className="customization-panel">
        <select
          value={presentationType}
          onChange={(e) => setPresentationType(e.target.value)}
        >
          <option value="pptx">PowerPoint</option>
          <option value="pdf">PDF</option>
        </select>

        <select
          value={customization.theme}
          onChange={(e) =>
            setCustomization({
              ...customization,
              theme: e.target.value,
            })
          }
        >
          <option value="professional">Professional</option>
          <option value="creative">Creative</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>

      <div className="slides-preview">
        {slides.map((slide, index) => (
          <div key={index} className="slide-preview">
            <h3>{slide.title}</h3>
            <p>{slide.content}</p>
          </div>
        ))}
      </div>

      <button onClick={handleExport} className="export-btn">
        Export {presentationType === "pptx" ? "PowerPoint" : "PDF"}
      </button>
    </div>
  );
}

export default PresentationPage;
