import React, { useState } from "react";
import Holdings from "./holdings";

const App = () => {
  const [activeTab, setActiveTab] = useState("portfolio"); // "portfolio" | "home"

  return (
    <>
      {/* Navigation tabs */}
      <div className="tab">
        <button
          className={activeTab === "portfolio" ? "active" : ""}
          onClick={() => setActiveTab("portfolio")}type="button"
        >
          Portfolio
        </button>

        <button
          className={activeTab === "home" ? "active" : ""}
          onClick={() => setActiveTab("home")}type="button"
        >
          Home
        </button>

        <button
          className={activeTab === "login" ? "active" : ""}
          onClick={() => setActiveTab("login")}
          ></button>
      </div>

      {/* Page content */}
      {activeTab === "portfolio" && (
        <>
          <h1>Portfolio</h1>
          <Holdings />
        </>
      )}

      {activeTab === "home" && (
        <>
          <h1>Home</h1>
  
        </>
      )}

      {activeTab === "login" && (
        <>
          <h1>Login</h1>
        </>
      )}
    </>
  );
};

export default App;
