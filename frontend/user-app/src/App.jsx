// App.jsx
import React, { useState } from "react";
import Holdings from "./holdings";
import Login from "./login";
import News from "./news";
import Graphics from "./graphics";
import Admin from "./admin";
import "./App.css";

const App = () => {
  const isAdmin = true; // Placeholder for user role check
  const loggedIn = true; // Placeholder for login status

  const [activeTab, setActiveTab] = useState(loggedIn ? "home" : "login");

  const goToTab = (tab) => {
    if (!loggedIn && tab !== "login") {
      setActiveTab("login");
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <>
      {/* Navigation tabs */}
      <div className="tab">
        <button
          className={activeTab === "home" ? "active" : ""}
          onClick={() => goToTab("home")}
          type="button"
        >
          Home
        </button>

        <button
          className={activeTab === "portfolio" ? "active" : ""}
          onClick={() => goToTab("portfolio")}
          type="button"
        >
          Portfolio
        </button>

        <button
          className={activeTab === "news" ? "active" : ""}
          onClick={() => goToTab("news")}
          type="button"
        >
          News
        </button>

        {isAdmin && (
          <button
            className={activeTab === "admin" ? "active" : ""}
            onClick={() => goToTab("admin")}
            type="button"
          >
            Admin
          </button>
        )}

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
        {isAdmin && activeTab === "admin" && <Admin />}
        {activeTab === "login" && <Login />}
      </main>
    </>
  );
};

export default App;
