import React, { useEffect, useState } from "react";
import Holdings from "./holdings";
import Login from "./login";
import Graphics from "./graphics";
import Admin from "./admin";
import TickerPage from "./tickerPage";
import "./App.css";

const App = () => {
  // auth state populated from backend
  const [authLoaded, setAuthLoaded] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [userName, setUserName] = useState("");
  //const isAdmin = true; // from backend
  //const loggedIn = true; // from backend

  const [activeTab, setActiveTab] = useState("account");
  const [selectedTicker, setSelectedTicker] = useState(null);

  // ping backend that app was opened
  useEffect(() => {
    fetch("https://ccic.onrender.com/api/app-open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }).catch((err) => {
      console.error("Failed to POST /api/app-open:", err);
    });
  }, []);

  // fetch auth status on app load
   const fetchAuthStatus = async () => {
      try {
        const res = await fetch(`https://ccic.onrender.com/api/auth/status`, {
          credentials: "include",
        });

        const data = await res.json();

        setLoggedIn(data.loggedIn);
        setIsAdmin(data.isAdmin);
        setIsMember(data.isMember);
        setUserName(data.userName || "");

        // set default redirect tab based on auth status
        setActiveTab(data.loggedIn ? "home" : "account");
      } catch (err) {
        console.error("Failed to fetch auth status:", err);
        setLoggedIn(false);
        setIsAdmin(false);
        setIsMember(false);
        setUserName("");
        setActiveTab("account");
      } finally {
        setAuthLoaded(true);
      }
    };

  // determine auth status on open
  useEffect(() => {
    fetchAuthStatus();
  }, []);

  // Prevent access to protected tabs when logged out
  const goToTab = (tab) => {
    setSelectedTicker(null);

    // restrict acces to account page
    if (!loggedIn && tab !== "account") {
      setActiveTab("account");
      return;
    } 
    setActiveTab(tab);
  };

  // logout function
  const sendLogout = async () => {
    try {
      await fetch("https://ccic.onrender.com/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      // reset auth state
      fetchAuthStatus();
    }
  }

  // loading state while auth status is being determined
  if (!authLoaded) {
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

        {/* Account or Login tab based on staus*/}
        <button
          className={`login-tab ${activeTab === "account" ? "active" : ""}`}
          onClick={() => goToTab("account")}
          type="button"
        >
          {loggedIn ? "Account" : "Login"}
        </button>
      </div>

      {/* Page content */}
      <main className="page">
        {/* Home tab */}
        {activeTab === "home" && <Graphics />}

        {/* Portfolio tab */}
        {activeTab === "portfolio" && (
          selectedTicker ? (
            <TickerPage ticker={selectedTicker} />
          ) : (
            <Holdings
            isAdmin={isAdmin}
            isMember={isMember}
            loggedIn={loggedIn}
            onSelectTicker={setSelectedTicker}
          />
          )
        )}

        {/* Account/Admin tab */}
        {activeTab === "account" &&
          (loggedIn ? (
            <>
              <Account
                userName={userName}
                isAdmin={isAdmin}
                isMember={isMember}
                onLogout={sendLogout}
              />
              {/* only show admin page if user is admin */}
              {isAdmin && <Admin />}
            </>
          ) : (
            <Login />
          ))}
      </main>
    </>
  );
};

export default App;
