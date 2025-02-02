import React from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaYoutube,
  FaBook,
  FaSlideshare,
  FaQuestionCircle,
  FaRegFileAlt,
} from "react-icons/fa";
import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">
        <Link to="/">NoteGPT</Link>
      </div>
      <nav>
        <Link to="/" className="nav-item">
          <FaHome /> Create
        </Link>
        <Link to="/youtube" className="nav-item">
          <FaYoutube /> AI YouTube
        </Link>
        <Link to="/presentation" className="nav-item">
          <FaSlideshare /> AI Presentation
        </Link>
        <Link to="/homework" className="nav-item beta">
          <FaQuestionCircle /> AI Homework Helper
          <span className="beta-tag">Beta</span>
        </Link>
        <Link to="/flashcards" className="nav-item">
          <FaRegFileAlt /> AI Flashcards
        </Link>
        <Link to="/library" className="nav-item">
          <FaBook /> AI Book Library
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;
