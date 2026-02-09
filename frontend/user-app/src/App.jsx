import React, { useEffect, useState } from "react";
import Holdings from "./holdings";
import Login from "./login";
import News from "./news";
import Graphics from "./graphics";
import Admin from "./admin";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://YOUR_BACKEND_DOMAIN";

const App = () => {
  const [auth, setAuth] = useState({
    loading: true,
    loggedIn: false,
    isAdmin: false,
    role: null,
    user: null
  });

  const [activeTab, setActiveTab] = useState("home");

  const fetchAuth = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: "GET",
        credentials: "include", 
      });

      const data = await res.json();
      setAuth({ loading: false, ...data });

      // If not logged in, force user to Account/Login tab
      if (!data.loggedIn) setActiveTab("account");
    } catch (e) {
      console.error("Failed to fetch auth status:", e);
      setAuth({ loading: false, loggedIn: false, isAdmin: false, role: null, user: null });
      setActiveTab("account");
    }
  };

  useEffect(() => {
    fetchAuth();
  }, []);

  const goToTab = (tab) => {
    // Prevent access to protected tabs when logged out
    if (!auth.loggedIn && tab !== "account") {
      setActiveTab("account");
    } else {
      setActiveTab(tab);
    }
  };

  if (auth.loading) {
    return <div className="page">Loading…</div>;
  }

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

        {/* Account / Login tab (right aligned) */}
        <button
          className={`login-tab ${activeTab === "account" ? "active" : ""}`}
          onClick={() => setActiveTab("account")}
          type="button"
        >
          {auth.loggedIn ? "Account" : "Login"}
        </button>
      </div>

      {/* Page content */}
      <main className="page">
        {activeTab === "home" && <Graphics />}
        {activeTab === "portfolio" && <Holdings />}
        {activeTab === "news" && <News />}

        {activeTab === "account" && (
          auth.loggedIn ? (
            auth.isAdmin ? <Admin /> : <div>Account page</div>
          ) : (
            <Login />
          )
        )}
      </main>
    </>
  );
};

export default App;
