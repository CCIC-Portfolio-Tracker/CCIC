import React, { useEffect, useState } from "react";
import Holdings from "./holdings";
import Login from "./login";
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
  const loggedIn = false; // from backend

  const [debugLoggedIn, setDebugLoggedIn] = useState(loggedIn);
  const [debugIsAdmin, setDebugIsAdmin] = useState(isAdmin);

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

    if (!debugLoggedIn && tab !== "account") {
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
        {activeTab === "account" && !debugLoggedIn && (
          <div style={{ marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => {
                setDebugLoggedIn((v) => !v);
                // if logging out, also clear admin
                setDebugIsAdmin(false);
              }}
              style={{ marginRight: 8 }}
            >
              Toggle Logged In (debug): {debugLoggedIn ? "ON" : "OFF"}
            </button>

            <button
              type="button"
              onClick={() => setDebugIsAdmin((v) => !v)}
              disabled={!debugLoggedIn}
              title={!debugLoggedIn ? "Log in (debug) first" : ""}
            >
              Toggle Admin (debug): {debugIsAdmin ? "ON" : "OFF"}
            </button>
          </div>
        )}

        {activeTab === "home" && <Graphics />}
        {/*{activeTab === "portfolio" && (
          <Holdings isAdmin={isAdmin} loggedIn={loggedIn} />
        )}
          */}
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

        {activeTab === "account" &&
          (debugLoggedIn ? (
            debugIsAdmin ? (
              <Admin />
            ) : (
              <div>Account page</div>
            )
          ) : (
            <Login />
          ))}
      </main>
    </>
  );
};

export default App;
