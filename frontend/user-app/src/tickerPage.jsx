import React from "react";
import News from "./news";

export default function TickerPage({ ticker }) {
  return (
    <div style={{ padding: 24 }}>
        {ticker}
        <News ticker={ticker} />
      </div>
  );
}