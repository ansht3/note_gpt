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
  FaPalette,
  FaKeyboard,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaCheck,
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

// Theme options
const THEMES = [
  { id: "default", name: "Default", icon: <FaSun /> },
  { id: "dark", name: "Dark", icon: <FaMoon /> },
  { id: "contrast", name: "High Contrast", icon: <FaLightbulb /> },
];

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showShortcutsMenu, setShowShortcutsMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const location = useLocation();
  const { isDarkMode, toggleTheme, currentTheme, setTheme } = useTheme();
  const sidebarRef = useRef(null);
  const languageMenuRef = useRef(null);
  const themeMenuRef = useRef(null);
  const shortcutsMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Keyboard shortcuts
  const shortcuts = {
    "Ctrl + /": "Toggle sidebar",
    "Ctrl + K": "Focus search",
    "Ctrl + L": "Toggle language menu",
    "Ctrl + T": "Toggle theme",
    "Ctrl + N": "Toggle notifications",
  };

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

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        const userData = {
          name: "John Doe",
          email: "john@example.com",
          avatar: null,
          preferences: {
            theme: currentTheme,
            language: selectedLanguage,
          },
        };
        setUserProfile(userData);
      } catch (err) {
        setError("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [currentTheme, selectedLanguage]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case "/":
            e.preventDefault();
            setIsOpen(!isOpen);
            break;
          case "k":
            e.preventDefault();
            document.querySelector(".search-input")?.focus();
            break;
          case "l":
            e.preventDefault();
            setShowLanguageMenu(!showLanguageMenu);
            break;
          case "t":
            e.preventDefault();
            setShowThemeMenu(!showThemeMenu);
            break;
          case "n":
            e.preventDefault();
            setShowNotifications(!showNotifications);
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, showLanguageMenu, showThemeMenu, showNotifications]);

  // Click outside handlers
  const handleClickOutside = useCallback(
    (event) => {
      const refs = [
        { ref: sidebarRef, state: isOpen, setter: setIsOpen },
        {
          ref: languageMenuRef,
          state: showLanguageMenu,
          setter: setShowLanguageMenu,
        },
        { ref: themeMenuRef, state: showThemeMenu, setter: setShowThemeMenu },
        {
          ref: shortcutsMenuRef,
          state: showShortcutsMenu,
          setter: setShowShortcutsMenu,
        },
        {
          ref: notificationsRef,
          state: showNotifications,
          setter: setShowNotifications,
        },
      ];

      refs.forEach(({ ref, state, setter }) => {
        if (state && ref.current && !ref.current.contains(event.target)) {
          setter(false);
        }
      });
    },
    [
      isOpen,
      showLanguageMenu,
      showThemeMenu,
      showShortcutsMenu,
      showNotifications,
    ]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // Filter nav items based on search query
  const filteredNavItems = navItems
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  const isActive = (path, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleLanguageChange = (langCode) => {
    try {
      setSelectedLanguage(langCode);
      setShowLanguageMenu(false);
      // Here you would typically dispatch an action to change the app's language
    } catch (err) {
      setError("Failed to change language. Please try again.");
    }
  };

  const handleThemeChange = (themeId) => {
    try {
      setTheme(themeId);
      setShowThemeMenu(false);
    } catch (err) {
      setError("Failed to change theme. Please try again.");
    }
  };

  const handleLogout = () => {
    // Implement logout logic
    console.log("Logging out...");
  };

  // New: handle clear search
  const handleClearSearch = () => setSearchQuery("");

  // New: handle user menu
  const handleUserMenu = () => setShowUserMenu((v) => !v);

  // New: mark all notifications as read
  const handleMarkAllRead = () => setNotifications([]);

  // New: theme preview
  const renderThemePreview = (themeId) => (
    <span className={`theme-preview theme-preview--${themeId}`}></span>
  );

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
        role="navigation"
        aria-label="Sidebar navigation"
      >
        <div className="sidebar-header">
          <div className="logo">
            <Link to="/" onClick={() => setIsOpen(false)} aria-label="Home">
              <span className="logo-icon">
                <FaLightbulb />
              </span>
              {!isCollapsed && <span className="logo-text">NoteGPT</span>}
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
          <div className={`search-container${searchQuery ? " has-value" : ""}`}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              aria-label="Search navigation"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>
        )}

        <nav role="navigation" aria-label="Main navigation">
          {filteredNavItems.map((section, idx) => (
            <React.Fragment key={section.section}>
              {idx > 0 && <div className="nav-divider" role="separator" />}
              {renderNavSection(section)}
            </React.Fragment>
          ))}
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

          <div className="action-buttons">
            <button
              className="action-button"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <FaBell />
              {notifications.length > 0 && (
                <span className="notification-badge">
                  {notifications.length}
                </span>
              )}
            </button>

            <button
              className="action-button"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              aria-label="Change theme"
            >
              <FaPalette />
            </button>

            <button
              className="action-button"
              onClick={() => setShowShortcutsMenu(!showShortcutsMenu)}
              aria-label="Keyboard shortcuts"
            >
              <FaKeyboard />
            </button>
          </div>
        </div>

        {/* Language Menu */}
        {showLanguageMenu && (
          <div ref={languageMenuRef} className="language-menu animated-menu">
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

        {/* Theme Menu */}
        {showThemeMenu && (
          <div ref={themeMenuRef} className="theme-menu animated-menu">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                className={`theme-option ${
                  currentTheme === theme.id ? "selected" : ""
                }`}
                onClick={() => handleThemeChange(theme.id)}
              >
                {renderThemePreview(theme.id)}
                {theme.icon}
                <span>{theme.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Shortcuts Menu */}
        {showShortcutsMenu && (
          <div ref={shortcutsMenuRef} className="shortcuts-menu animated-menu">
            <h3>Shortcuts</h3>
            {Object.entries(shortcuts).map(([key, description]) => (
              <div key={key} className="shortcut-item">
                <kbd>{key}</kbd>
                <span>{description}</span>
              </div>
            ))}
          </div>
        )}

        {showNotifications && (
          <div
            ref={notificationsRef}
            className="notifications-panel animated-menu"
          >
            <div className="notifications-header">
              <h3>Notifications</h3>
              {notifications.length > 0 && (
                <button
                  className="mark-all-read"
                  onClick={handleMarkAllRead}
                  aria-label="Mark all as read"
                >
                  <FaCheck /> Mark all as read
                </button>
              )}
            </div>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div key={index} className="notification-item">
                  <FaBell className="notification-icon" />
                  <span>{notification.content}</span>
                  <span className="notification-time">
                    {notification.time || "now"}
                  </span>
                </div>
              ))
            ) : (
              <div className="no-notifications">No new notifications</div>
            )}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </>
  );
}

export default Sidebar;
