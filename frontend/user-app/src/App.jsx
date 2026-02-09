import React, { useState } from "react";
import Holdings from "./holdings";
import Login from "./login";
import News from "./news";
import Graphics from "./graphics";
import Admin from "./admin";
import "./App.css";

const App = () => {
  const loggedIn = true;   // placeholder: replace with real auth later
  const isAdmin = true;   // placeholder: role check if needed later

  const [activeTab, setActiveTab] = useState(
    loggedIn ? "home" : "account"
  );

  const goToTab = (tab) => {
    // Prevent access to protected tabs when logged out
    if (!loggedIn && tab !== "account") {
      setActiveTab("account");
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

        {/* Account / Login tab */}
        <button
          className={`login-tab ${activeTab === "account" ? "active" : ""}`}
          onClick={() => setActiveTab("account")}
          type="button"
        >
          {loggedIn ? "Account" : "Login"}
        </button>
      </div>

      {/* Page content */}
      <main className="page">
        {activeTab === "home" && <Graphics />}
        {activeTab === "portfolio" && <Holdings />}
        {activeTab === "news" && <News />}

        {activeTab === "account" && (
          loggedIn ? (
            isAdmin ? <Admin /> : <div>Account page</div>
          ) : (
            <Login />
          )
        )}
      </main>
    </>
  );
};

export default App;
