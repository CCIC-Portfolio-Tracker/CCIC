import React from "react";
import News from "./news";

export default function TickerPage({ ticker }) {
  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          height: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        {ticker}
        <News ticker={ticker} />
      </div>
    </div>
  );
}