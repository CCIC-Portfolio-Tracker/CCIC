// App.jsx
import React, { useState } from "react";
import Holdings from "./holdings";
import Login from "./login";
import News from "./news";
import Graphics from "./graphics";  
import "./App.css";


function TickerScreen({ ticker, onBack }) {
  return (
    <div className="ticker-screen">
      <div className="ticker-header">
        <button type="button" onClick={onBack}>← Back</button>
        <h2 style={{ marginLeft: 12 }}>{ticker}</h2>
      </div>

      {/* blank page content for now */}
      <div className="ticker-body">
        <p>{ticker} details page (blank for now)</p>
      </div>
    </div>
  );
}

const App = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedTicker, setSelectedTicker] = useState("");

  const openTicker = (ticker) => {
    setSelectedTicker(ticker);
    setActiveTab("ticker");
  };

  const backToPortfolio = () => {
    setActiveTab("portfolio");
  };

  return (
    <>
      {/* Navigation tabs */}
      <div className="tab">
        <button
          className={activeTab === "home" ? "active" : ""}
          onClick={() => setActiveTab("home")}
          type="button"
        >
          Home
        </button>

        <button
          className={activeTab === "portfolio" ? "active" : ""}
          onClick={() => setActiveTab("portfolio")}
          type="button"
        >
          Portfolio
        </button>

        <button
          className={activeTab === "login" ? "active" : ""}
          onClick={() => setActiveTab("login")}
          type="button"
        >
          Login
        </button>
      </div>

      {/* Page content */}
      <main className="page">
        {activeTab === "home" && [<News key="news" />, <Graphics key="graphics" />]}
        {activeTab === "portfolio" && <Holdings />}
        {activeTab === "login" && <Login />}
        {activeTab === "ticker" && (
          <TickerScreen ticker={selectedTicker} onBack={backToPortfolio} />
        )}
      </main>
    </>
  );
};

export default App;
