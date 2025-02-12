import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaYoutube,
  FaBook,
  FaSlideshare,
  FaQuestionCircle,
  FaRegFileAlt,
  FaBars,
  FaTimes,
  FaLightbulb,
} from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import "./Sidebar.css";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  // Close sidebar on route change in mobile view
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".sidebar")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const navItems = [
    { path: "/", label: "Create", icon: <FaHome /> },
    { path: "/youtube", label: "AI YouTube", icon: <FaYoutube /> },
    { path: "/presentation", label: "AI Presentation", icon: <FaSlideshare /> },
    {
      path: "/homework",
      label: "AI Homework Helper",
      icon: <FaQuestionCircle />,
      isBeta: true,
    },
    { path: "/flashcards", label: "AI Flashcards", icon: <FaRegFileAlt /> },
    { path: "/library", label: "AI Book Library", icon: <FaBook /> },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <button
        className="mobile-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="logo">
          <Link to="/" onClick={() => setIsOpen(false)}>
            NoteGPT
          </Link>
        </div>

        <nav role="navigation">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? "active" : ""} ${
                item.isBeta ? "beta" : ""
              }`}
              aria-current={isActive(item.path) ? "page" : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.isBeta && <span className="beta-tag">Beta</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
          >
            <FaLightbulb />
            <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}

export default Sidebar;
