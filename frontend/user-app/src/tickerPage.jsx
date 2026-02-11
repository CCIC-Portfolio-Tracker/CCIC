import React from "react";
import News from "./news";
import "./tickerPage.css";

/**
 * Generates a ticker page to display news articles related to that ticker
 * @param {*} ticker 
 * @returns ticker page
 */
export default function TickerPage({ ticker }) {
  return (
    <div className="ticker-page">
      <h1 className="ticker-heading">{ticker}</h1>
      <News ticker={ticker} />
    </div>
  );
}
