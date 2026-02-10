import React, { useState } from "react";
import Holdings from "./holdings";
import TickerPage from "./tickerPage";

export default function Portfolio() {
  const [selectedTicker, setSelectedTicker] = useState(null);

  if (selectedTicker) {
    return (
      <TickerPage
        ticker={selectedTicker}
        onBack={() => setSelectedTicker(null)}
      />
    );
  }

  return <Holdings onSelectTicker={setSelectedTicker} />;
}
