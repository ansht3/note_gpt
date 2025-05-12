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
  FaLanguage,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaHistory,
} from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import "./Sidebar.css";

// Language options
const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "zh", name: "中文" },
];

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const sidebarRef = useRef(null);
  const languageMenuRef = useRef(null);

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
    {
      section: "recent",
      items: [
        { path: "/favorites", label: "Favorites", icon: <FaStar /> },
        { path: "/history", label: "History", icon: <FaHistory /> },
      ],
    },
  ];

  // Filter nav items based on search query
  const filteredNavItems = navItems
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  const handleClickOutside = useCallback(
    (event) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
      if (
        showLanguageMenu &&
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target)
      ) {
        setShowLanguageMenu(false);
      }
    },
    [isOpen, showLanguageMenu]
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

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    setShowLanguageMenu(false);
    // Here you would typically dispatch an action to change the app's language
  };

  const renderNavSection = useCallback(
    (section) => (
      <div key={section.section} className="nav-section">
        <h3 className="section-title">{section.section}</h3>
        {section.items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${
              isActive(item.path, item.exact) ? "active" : ""
            } ${item.isBeta ? "beta" : ""}`}
            aria-current={isActive(item.path, item.exact) ? "page" : undefined}
            onClick={() => setIsOpen(false)}
            onMouseEnter={(e) => e.currentTarget.classList.add("hover")}
            onMouseLeave={(e) => e.currentTarget.classList.remove("hover")}
          >
            {item.icon}
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
            {item.isBeta && !isCollapsed && (
              <span className="beta-tag">Beta</span>
            )}
          </Link>
        ))}
      </div>
    ),
    [isActive, isCollapsed]
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

      <div
        ref={sidebarRef}
        className={`sidebar ${isOpen ? "open" : ""} ${
          isCollapsed ? "collapsed" : ""
        }`}
      >
        <div className="sidebar-header">
          <div className="logo">
            <Link to="/" onClick={() => setIsOpen(false)}>
              {!isCollapsed && "NoteGPT"}
            </Link>
          </div>
          <button
            className="collapse-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        {!isCollapsed && (
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        )}

        <nav role="navigation" aria-label="Main navigation">
          {filteredNavItems.map(renderNavSection)}
        </nav>

        <div className="language-switcher">
          <button
            className="language-button"
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            aria-expanded={showLanguageMenu}
          >
            <FaLanguage />
            {!isCollapsed && (
              <span>
                {LANGUAGES.find((lang) => lang.code === selectedLanguage)?.name}
              </span>
            )}
          </button>
          {showLanguageMenu && (
            <div className="language-menu">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  className={`language-option ${
                    selectedLanguage === lang.code ? "selected" : ""
                  }`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;
