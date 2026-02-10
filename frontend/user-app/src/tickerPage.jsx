import React from "react";
import News from "./news";
import "./tickerPage.css";

export default function TickerPage({ ticker }) {
  return (
    <div className="ticker-page">
      <h1 className="ticker-heading">{ticker}</h1>
      <News ticker={ticker} />
    </div>
  );
}
