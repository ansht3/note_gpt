import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./App.css";

// Lazy load components for better performance
const HomePage = lazy(() => import("./components/HomePage"));
const SummaryPage = lazy(() => import("./components/SummaryPage"));
const TranscriptPage = lazy(() => import("./components/TranscriptPage"));
const FlashcardsPage = lazy(() => import("./components/FlashcardsPage"));
const PresentationPage = lazy(() => import("./components/PresentationPage"));
const AskQuestionsPage = lazy(() => import("./components/AskQuestionsPage"));

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Router>
          <div className="app">
            <Sidebar />
            <main className="main-content">
              <div className="top-bar">
                <div className="theme-toggle">
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider round"></span>
                  </label>
                  <span>Dark Mode</span>
                </div>
                <select className="language-select">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
              <Suspense
                fallback={
                  <div className="loading-container">
                    <LoadingSpinner />
                  </div>
                }
              >
                <ErrorBoundary>
                  <Switch>
                    <Route exact path="/" component={HomePage} />
                    <Route path="/summary" component={SummaryPage} />
                    <Route path="/transcript" component={TranscriptPage} />
                    <Route path="/flashcards" component={FlashcardsPage} />
                    <Route path="/presentation" component={PresentationPage} />
                    <Route path="/ask" component={AskQuestionsPage} />
                    <Route path="*">
                      <div className="not-found">
                        <h1>404: Page Not Found</h1>
                        <p>The page you're looking for doesn't exist.</p>
                      </div>
                    </Route>
                  </Switch>
                </ErrorBoundary>
              </Suspense>
            </main>
          </div>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
