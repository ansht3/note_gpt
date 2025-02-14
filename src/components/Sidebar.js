import React, { useState, useEffect, useCallback } from "react";
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
  const [activeSection, setActiveSection] = useState("");
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

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
      if (isOpen && !event.target.closest(".sidebar")) {
        setIsOpen(false);
      }
    },
    [isOpen]
  );

  // Close sidebar on route change in mobile view
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // Update active section based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const section = navItems.find((section) =>
      section.items.some((item) =>
        item.exact
          ? currentPath === item.path
          : currentPath.startsWith(item.path)
      )
    );
    setActiveSection(section?.section || "");
  }, [location.pathname]);

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const renderNavSection = (section) => (
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

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="logo">
          <Link to="/" onClick={() => setIsOpen(false)}>
            NoteGPT
          </Link>
        </div>

        <nav role="navigation" aria-label="Main navigation">
          {navItems.map(renderNavSection)}
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
