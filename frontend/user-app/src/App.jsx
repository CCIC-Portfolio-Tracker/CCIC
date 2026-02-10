import React, { useEffect, useState } from "react";
import Holdings from "./holdings";
import Login from "./login";
import Graphics from "./graphics";
import Admin from "./admin";
import Account from "./account";
import TickerPage from "./tickerPage";
import "./App.css";

const App = () => {
  // auth state populated from backend
  //const [loggedIn, setLoggedIn] = useState(false);
  //const [isAdmin, setIsAdmin] = useState(false);
  //const [authLoaded, setAuthLoaded] = useState(false);
  const isAdmin = true; // from backend
  const loggedIn = false; // from backend

  const [debugLoggedIn, setDebugLoggedIn] = useState(loggedIn);
  const [debugIsAdmin, setDebugIsAdmin] = useState(isAdmin);

  const [activeTab, setActiveTab] = useState("account");
  const [selectedTicker, setSelectedTicker] = useState(null);

  // log that someone opened the app 
  useEffect(() => {
    fetch("https://ccic.onrender.com/api/app-open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch((err) => {
      console.error("Failed to POST /api/app-open:", err);
    });
  }, []);

  const goToTab = (tab) => {
    // Prevent access to protected tabs when logged out
    setSelectedTicker(null);

    if (!debugLoggedIn && tab !== "account") {
      setActiveTab("account");
    } else {
      setActiveTab(tab);
    }
  };

  const DebugToggles = () => (
    <div style={{ marginBottom: 12 }}>
      <button
        type="button"
        onClick={() => {
          // logout toggle
          if (debugLoggedIn) {
            setDebugLoggedIn(false);
            setDebugIsAdmin(false);
            setActiveTab("account");
            setSelectedTicker(null);
          } else {
            setDebugLoggedIn(true);
          }
        }}
        style={{ marginRight: 8 }}
      >
        {debugLoggedIn ? "Log out (debug)" : "Log in (debug)"}
      </button>

      <button
        type="button"
        onClick={() => {
          setDebugLoggedIn(true);
          setDebugIsAdmin(true);
        }}
        style={{ marginRight: 8 }}
      >
        Make Admin (debug)
      </button>

      <button
        type="button"
        onClick={() => setDebugIsAdmin(false)}
        disabled={!debugLoggedIn}
        title={!debugLoggedIn ? "Log in (debug) first" : ""}
      >
        Remove Admin (debug)
      </button>
    </div>
  );

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
          {debugLoggedIn ? "Account" : "Login"}
        </button>
      </div>

      {/* Page content */}
      <main className="page">
        {activeTab === "home" && <Graphics />}

        {activeTab === "portfolio" &&
          (selectedTicker ? (
            <TickerPage ticker={selectedTicker} />
          ) : (
            <Holdings
              isAdmin={debugIsAdmin}
              loggedIn={debugLoggedIn}
              onSelectTicker={setSelectedTicker}
            />
          ))}

        {activeTab === "account" && <DebugToggles />}

        {activeTab === "account" &&
          (debugLoggedIn ? (
            debugIsAdmin ? (
              <>
                <Account />
                <Admin />
              </>
            ) : (
              <Account />
            )
          ) : (
            <Login />
          ))}
      </main>
    </>
  );
};

export default App;



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
