import React, { useEffect, useState } from "react";
import Holdings from "./holdings";
import Login from "./login";
import News from "./news";
import Graphics from "./graphics";
import Admin from "./admin";
import TickerPage from "./tickerPage";
import "./App.css";

const App = () => {
  // auth state populated from backend
  //const [loggedIn, setLoggedIn] = useState(false);
  //const [isAdmin, setIsAdmin] = useState(false);
  //const [authLoaded, setAuthLoaded] = useState(false);
  const isAdmin = true; // from backend
  const loggedIn = true; // from backend

  const [activeTab, setActiveTab] = useState("account");
  const [selectedTicker, setSelectedTicker] = useState(null);

  // fetch auth status on app load
 /*useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const res = await fetch(`https://ccic.onrender.com/api/auth/status`, {
          credentials: "include",
        });

        const data = await res.json();

        setLoggedIn(data.loggedIn);
        setIsAdmin(data.isAdmin);

        setActiveTab(data.loggedIn ? "home" : "account");
      } catch (err) {
        console.error("Failed to fetch auth status:", err);
        setLoggedIn(false);
        setIsAdmin(false);
        setActiveTab("account");
      } finally {
        setAuthLoaded(true);
      }
    };

    fetchAuthStatus();
  }, []);

  */
  const goToTab = (tab) => {
    // Prevent access to protected tabs when logged out
    setSelectedTicker(null);

    if (!loggedIn && tab !== "account") {
      setActiveTab("account");
    } else {
      setActiveTab(tab);
    }
  };
/*
  // loading state while auth status is being determined
  if (!authLoaded) {
    return <div className="page">Loading…</div>;
  }
    */

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
        {activeTab === "home" && <Graphics />}
        {/*{activeTab === "portfolio" && (
          <Holdings isAdmin={isAdmin} loggedIn={loggedIn} />
        )}
          */}
        {activeTab === "portfolio" && (
          selectedTicker ? (
            <TickerPage ticker={selectedTicker} />
          ) : (
            <Holdings
              isAdmin={isAdmin}
              loggedIn={loggedIn}
              onSelectTicker={setSelectedTicker} 
            />
          )
        )}

        {activeTab === "news" && <News />}

        {activeTab === "account" &&
          (loggedIn ? (isAdmin ? <Login /> : <div>Account page</div>) : <Login />)}
      </main>
    </>
  );
};

export default App;
