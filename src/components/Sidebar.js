import React, { useState, useEffect, useCallback, useRef } from "react";
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
  FaCog,
  FaUser,
} from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import "./Sidebar.css";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const sidebarRef = useRef(null);

  const navItems = [
    {
      section: "create",
      items: [
        { path: "/", label: "Create", icon: <FaHome />, exact: true },
        { path: "/youtube", label: "AI YouTube", icon: <FaYoutube /> },
        {
          path: "/presentation",
          label: "AI Presentation",
          icon: <FaSlideshare />,
        },
      ],
    },
    {
      section: "tools",
      items: [
        {
          path: "/homework",
          label: "AI Homework Helper",
          icon: <FaQuestionCircle />,
          isBeta: true,
        },
        { path: "/flashcards", label: "AI Flashcards", icon: <FaRegFileAlt /> },
        { path: "/library", label: "AI Book Library", icon: <FaBook /> },
      ],
    },
  ];

  const handleClickOutside = useCallback(
    (event) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    },
    [isOpen]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isActive = (path, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const renderNavSection = useCallback(
    (section) => (
      <div key={section.section} className="nav-section">
        {section.items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${
              isActive(item.path, item.exact) ? "active" : ""
            } ${item.isBeta ? "beta" : ""}`}
            aria-current={isActive(item.path, item.exact) ? "page" : undefined}
            onClick={() => setIsOpen(false)}
          >
            {item.icon}
            <span className="nav-label">{item.label}</span>
            {item.isBeta && <span className="beta-tag">Beta</span>}
          </Link>
        ))}
      </div>
    ),
    [isActive]
  );

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

      <div ref={sidebarRef} className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="logo">
          <Link to="/" onClick={() => setIsOpen(false)}>
            NoteGPT
          </Link>
        </div>

        <nav role="navigation" aria-label="Main navigation">
          {navItems.map(renderNavSection)}
        </nav>

        <div className="sidebar-footer">
          {/* <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
          >
            <FaLightbulb />
            <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          </button> */}

          <div></div>

          <div className="footer-actions">
            <Link to="/settings" className="footer-link">
              <FaCog />
              <span>Settings</span>
            </Link>
            <Link to="/profile" className="footer-link">
              <FaUser />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default Sidebar;
