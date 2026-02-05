import React from "react";
import { useParams, Link } from "react-router-dom";

export default function TickerPage() {
  const { ticker } = useParams();

  return (
    <div style={{ padding: 16 }}>
      <h1>{ticker}</h1>
    </div>
  );
}
