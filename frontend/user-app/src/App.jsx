import React, { useEffect, useState } from "react";
import Holdings from "./holdings";
import Login from "./login";
import News from "./news";
import Graphics from "./graphics";
import Admin from "./admin";
import "./App.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://ccic.onrender.com";

const App = () => {
  // 🔹 auth state now comes from backend
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("home");

  // 🔹 fetch auth status from backend
  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/status`, {
          credentials: "include",
        });

        const data = await res.json();

        setLoggedIn(data.loggedIn);
        setIsAdmin(data.isAdmin);
      } catch (err) {
        console.error("Failed to fetch auth status:", err);
        setLoggedIn(false);
        setIsAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    };

    fetchAuthStatus();
  }, []);

  const goToTab = (tab) => {
    // Prevent access to protected tabs when logged out
    if (!loggedIn && tab !== "account") {
      setActiveTab("account");
    } else {
      setActiveTab(tab);
    }
  };

  // Optional: avoid UI flicker before auth loads
  if (authLoading) {
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
