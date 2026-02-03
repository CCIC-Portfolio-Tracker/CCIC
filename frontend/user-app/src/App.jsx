import React, { useState } from "react";
import Holdings from "./holdings";
import Graphics from "./graphics";

const App = () => {
  const [activeTab, setActiveTab] = useState("portfolio"); // "portfolio" | "home"

  return (
    <>
      {/* Navigation tabs */}
      <div className="tab">
        <a
          className={activeTab === "portfolio" ? "active" : ""}
          onClick={() => setActiveTab("portfolio")}
        >
          Portfolio
        </a>
        <a
          className={activeTab === "home" ? "active" : ""}
          onClick={() => setActiveTab("home")}
        >
          Home
        </a>
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
    </>
  );
};

export default App;
