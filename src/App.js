import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import HomePage from "./components/HomePage";
import SummaryPage from "./components/SummaryPage";
import TranscriptPage from "./components/TranscriptPage";
import FlashcardsPage from "./components/FlashcardsPage";
import PresentationPage from "./components/PresentationPage";
import AskQuestionsPage from "./components/AskQuestionsPage";
import Sidebar from "./components/Sidebar";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <div className="top-bar">
            <h2>Create</h2>
            <div className="theme-toggle">
              <span>Dark</span>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
              </label>
              <span>Light</span>
              <select className="language-select">
                <option>English</option>
              </select>
            </div>
          </div>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/summary" component={SummaryPage} />
            <Route path="/transcript" component={TranscriptPage} />
            <Route path="/flashcards" component={FlashcardsPage} />
            <Route path="/presentation" component={PresentationPage} />
            <Route path="/ask" component={AskQuestionsPage} />
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;
