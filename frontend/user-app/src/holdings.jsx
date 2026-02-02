import React, { useEffect, useMemo, useState } from "react";
import { Grid } from "gridjs-react";
//import "gridjs/dist/theme/mermaid.css";
import "./App.css";

const columns = ["Ticker", "Name", "Price", "Total Value"];

function Holdings() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch("/api/holdings")
      .then((res) => res.json())
      .then((json) => {
        const mapped = (json || []).map((d) => [
          d.ticker ?? "",
          d.name ?? "",
          d.price ?? 0,
          d.totalValue ?? 0,
        ]);
        setRows(mapped);
      })
      .catch((err) => {
        console.error("Failed to load /api/holdings:", err);
        setRows([]);
      });
  }, []);

  const addRow = () => {
    const ticker = prompt("Enter Ticker (e.g., AAPL):");
    if (!ticker) return;

    const name = prompt("Enter Name:") || "";

    const priceStr = prompt("Enter Price:");
    if (!priceStr) return;
    const price = Number(priceStr);
    if (Number.isNaN(price)) {
      alert("Price must be a number.");
      return;
    }

    const totalValueStr = prompt("Enter Total Value:");
    if (!totalValueStr) return;
    const totalValue = Number(totalValueStr);
    if (Number.isNaN(totalValue)) {
      alert("Total Value must be a number.");
      return;
    }

    setRows((prev) => [...prev, [ticker, name, price, totalValue]]);
  };

  const gridStyle = useMemo(
    () => ({
      table: {
        "font-family": "Arial, sans-serif",
        "font-size": "14px",
      },
      th: {
        "background-color": "#f2f2f2",
        color: "#333",
        padding: "10px",
        "text-align": "left",
      },
      td: {
        padding: "10px",
        "border-bottom": "1px solid #ddd",
      },
    }),
    []
  );

  return (
    <>
      <button id="add-row-btn" onClick={addRow}>
        Add New Holding
      </button>

      <div id="wrapper">
        <Grid
          columns={columns}
          data={rows}
          search={true}
          sort={true}
          resizable={true}
          style={gridStyle}
        />
      </div>
    </>
  );
}

export default Holdings;
