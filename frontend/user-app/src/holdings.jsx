import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Grid } from "gridjs-react";
import { html } from "gridjs";
import "gridjs/dist/theme/mermaid.css";

function Holdings({ onSelectTicker, isAdmin }) {
  //const [rows, setRows] = useState([]);
  //const [isAdmin, setIsAdmin] = useState(false); // from backend
  const [rows, setRows] = useState([]);

  // get isAdmin from backend session
  /*useEffect(() => {
    fetch("https://ccic.onrender.com/api/auth/status", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setIsAdmin(!!data.isAdmin))
      .catch((err) => {
        console.error("Failed to load /api/auth/status:", err);
        setIsAdmin(false);
      });
  }, []);
  */

  // load from backend function
  const loadHoldings = useCallback(() => {
    fetch("https://ccic.onrender.com/api/holdings")
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
    if (!isAdmin) return; // admin-only guard

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
      const res = await fetch("https://ccic.onrender.com/api/holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ticker, shares, sector }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      loadHoldings();
    } catch (e) {
      console.error("POST /api/holdings failed:", e);
      alert("Failed to add holding.");
    }
  };

  // send edit to backend
  const editHolding = useCallback(
    async (ticker) => {
      if (!isAdmin) return; // admin-only guard

      const shares = prompt("Enter Share Count:");
      const sector = prompt("Enter sector");

      const updates = {};
      if (shares !== null && shares !== "") updates.shares = shares;
      if (sector !== null && sector !== "") updates.sector = sector;

      if (Object.keys(updates).length === 0) return;

      try {
        const res = await fetch(
          `https://ccic.onrender.com/api/holdings/${encodeURIComponent(ticker)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(updates),
          }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }

        loadHoldings();
      } catch (e) {
        console.error("PUT /api/holdings failed:", e);
        alert("Failed to edit holding.");
      }
    },
    [isAdmin, loadHoldings]
  );

  // send delete to backend
  const deleteHolding = useCallback(
    async (ticker) => {
      if (!isAdmin) return; // admin-only guard

      const ok = window.confirm(`Delete ${ticker}?`);
      if (!ok) return;

      try {
        const res = await fetch(
          `https://ccic.onrender.com/api/holdings/${encodeURIComponent(ticker)}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }

        loadHoldings();
      } catch (e) {
        console.error("DELETE /api/holdings failed:", e);
        alert("Failed to delete holding.");
      }
    },
    [isAdmin, loadHoldings]
  );

  // columns (Ticker is clickable)
  const columns = useMemo(
    () =>
      [
        {
          name: "Ticker",
          formatter: (cell) => {
            const ticker = String(cell ?? "");
            return html(
              `<a href="#" class="ticker-link" data-ticker="${ticker}">${ticker}</a>`
            );
          },
        },
        "Name",
        "Shares",
        "Current Price",
        "Total Value",
        isAdmin
          ? {
              name: "Actions",
              formatter: (cell, row) => {
                const ticker = row.cells[0].data;
                return html(`
                  <button class="edit-btn" data-ticker="${ticker}">Edit</button>
                  <button class="delete-btn" data-ticker="${ticker}">Delete</button>
                `);
              },
            }
          : undefined,
      ].filter(Boolean),
    [isAdmin]
  );

  // click handling (ticker link + buttons)
  useEffect(() => {
    const wrapper = document.getElementById("wrapper");
    if (!wrapper) return;

    const onClick = (e) => {
      // ticker link
      const link = e.target.closest("a.ticker-link");
      if (link) {
        e.preventDefault();
        const ticker = link.getAttribute("data-ticker");
        if (ticker && onSelectTicker) onSelectTicker(ticker);
        return;
      }

      // Only admins can use edit/delete buttons
      if (!isAdmin) return;

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
  }, [isAdmin, editHolding, deleteHolding, onSelectTicker]);

  // grid styling
  const gridStyle = useMemo(
    () => ({
      table: { "font-family": "Arial, sans-serif", "font-size": "14px" },
      th: {
        "background-color": "#f2f2f2",
        color: "#333",
        padding: "10px",
        "text-align": "left",
      },
      td: { padding: "10px", "border-bottom": "1px solid #ddd" },
    }),
    []
  );

  return (
    <>
      {isAdmin && (
        <button id="add-row-btn" onClick={addRow}>
          Add New Holding
        </button>
      )}

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
