// App.jsx
import React, { useState } from "react";
import Holdings from "./holdings";
import Login from "./login";
import News from "./news";
import Graphics from "./graphics";
import "./App.css";

const App = () => {
  const [activeTab, setActiveTab] = useState("home");

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
          className={activeTab === "news" ? "active" : ""}
          onClick={() => setActiveTab("news")}
          type="button"
        >
          News
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
        {activeTab === "home" && (
          <>
            <Graphics />
          </>
        )}
        {activeTab === "portfolio" && <Holdings />}
        {activeTab === "news" && <News />}
        {activeTab === "login" && <Login />}
      </main>
    </>
  );
};

export default App;
