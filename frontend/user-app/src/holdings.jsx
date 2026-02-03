import React, { useEffect, useMemo, useState, useCallback, use } from "react";
import { Grid } from "gridjs-react";
import { html } from "gridjs"; // <-- ADD THIS
import "gridjs/dist/theme/mermaid.css";
import "./App.css";

// holdings component
function Holdings() {
  const [rows, setRows] = useState([]);

  // load from backend function
  const loadHoldings = useCallback(() => {
    fetch("/api/holdings")
      .then((res) => res.json())
      .then((json) => {
        const mapped = (json || []).map((d) => [
          d.ticker ?? "",
          d.name ?? "",
          d.holdings ?? 0,
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

  // initial load
  useEffect(() => {
    loadHoldings();
  }, [loadHoldings]);

  // send add to backend via POST, then reload from backend
  const addRow = async () => {
    const ticker = prompt("Enter Ticker (e.g., AAPL):");
    if (!ticker) return;

    const shareSt = prompt("Enter Share Count:");
    if (!shareSt) return;
    const shares = Number(shareSt);
    if (Number.isNaN(shares)) {
      alert("Share must be a number.");
      return;
    }

    const sector = prompt("Enter Sector:");
    if (!sector) return;

    try {
      const res = await fetch("/api/holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, shares, sector}),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      // reload from backend so UI reflects backend
      loadHoldings();
    } catch (e) {
      console.error("POST /api/holdings failed:", e);
      alert("Failed to add holding.");
    }
  };

  // send edit to backend
  const editHolding = async (ticker) => {
    const name = prompt("New Name (blank = keep same):");
    const priceStr = prompt("New Price (blank = keep same):");
    const totalValueStr = prompt("New Total Value (blank = keep same):");

    const updates = {};

    if (name !== null && name !== "") updates.name = name;

    if (priceStr !== null && priceStr !== "") {
      const price = Number(priceStr);
      if (Number.isNaN(price)) return alert("Price must be a number.");
      updates.price = price;
    }

    if (totalValueStr !== null && totalValueStr !== "") {
      const totalValue = Number(totalValueStr);
      if (Number.isNaN(totalValue)) return alert("Total Value must be a number.");
      updates.totalValue = totalValue;
    }

    // If user left everything blank, do nothing
    if (Object.keys(updates).length === 0) return;

    try {
      const res = await fetch(`/api/holdings/${encodeURIComponent(ticker)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      loadHoldings();
    } catch (e) {
      console.error("PUT /api/holdings failed:", e);
      alert("Failed to edit holding.");
    }
  };

  // send delete to backend
  const deleteHolding = async (ticker) => {
    const ok = window.confirm(`Delete ${ticker}?`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/holdings/${encodeURIComponent(ticker)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      loadHoldings();
    } catch (e) {
      console.error("DELETE /api/holdings failed:", e);
      alert("Failed to delete holding.");
    }
  };

  //  add an Actions column that renders buttons
  const columns = useMemo(
    () => [
      "Ticker",
      "Name",
      "Shares",
      "Current Price",
      "Total Value",
      {
        name: "Actions",
        formatter: (cell, row) => {
          const ticker = row.cells[0].data; // first col is ticker
          return html(`
            <button class="edit-btn" data-ticker="${ticker}">Edit</button>
            <button class="delete-btn" data-ticker="${ticker}">Delete</button>
          `);
        },
      },
    ],
    []
  );

  // handle button clicks
  // change this to only populate if user has admin acesss
  useEffect(() => {
    const wrapper = document.getElementById("wrapper");
    if (!wrapper) return;

    const onClick = (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const ticker = btn.getAttribute("data-ticker");
      if (!ticker) return;

      if (btn.classList.contains("edit-btn")) {
        editHolding(ticker);
      } else if (btn.classList.contains("delete-btn")) {
        deleteHolding(ticker);
      }
    };

    wrapper.addEventListener("click", onClick);
    return () => wrapper.removeEventListener("click", onClick);
  }, [rows]); // rows changes cause re-render

  // Add styling
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
