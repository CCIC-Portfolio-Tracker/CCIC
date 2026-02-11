import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Grid } from "gridjs-react";
import { html } from "gridjs";
import "gridjs/dist/theme/mermaid.css";
import "./index.css";

const SECTOR_OPTIONS = [
  "Technology",
  "Healthcare",
  "Energy/Infrastructure",
  "Consumer",
  "Financials",
  "Aerospace & Defense",
  "Real Estate",
  "Emerging Markets",
  "ETF",
  "Bankruptcy",
  "Other",
];

function Holdings({isAdmin, isMember, loggedIn, onSelectTicker}) {
  // Grid rows displayed in GridJS
  const [rows, setRows] = useState([]);

  // Modal UI state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("buy"); // "buy" | "sell"
  const [busy, setBusy] = useState(false);
  const [modalError, setModalError] = useState("");

  // Shared form fields (ticker/shares always; sector & purchasePrice are for buying)
  const [form, setForm] = useState({
    ticker: "",
    shares: "",
    sector: "Technology", // buy-only
    purchasePrice: "", // buy-only
  });

  // Load holdings from backend and map them to GridJS row arrays
  const loadHoldings = useCallback(() => {
    fetch("https://ccic.onrender.com/api/holdings", { credentials: "include" })
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

  // Initial portfolio load
  useEffect(() => {
    loadHoldings();
  }, [loadHoldings]);

  // Close modal and clear transient state
  const closeModal = () => {
    setModalOpen(false);
    setBusy(false);
    setModalError("");
  };

  // Open Buy modal with defaults
  const openBuyModal = () => {
    if (!isAdmin) return;
    setModalMode("buy");
    setForm({
      ticker: "",
      shares: "",
      sector: "Technology",
      purchasePrice: "",
    });
    setModalError("");
    setModalOpen(true);
  };

  // Open Sell modal with defaults (sector/purchasePrice ignored for sell)
  const openSellModal = () => {
    if (!isAdmin) return;
    setModalMode("sell");
    setForm({
      ticker: "",
      shares: "",
      sector: "Technology",
      purchasePrice: "",
    });
    setModalError("");
    setModalOpen(true);
  };

  // Validate common fields for buy/sell + buy-only fields when in buy mode
  const validate = () => {
    const ticker = String(form.ticker || "").trim().toUpperCase();
    const shares = Number(form.shares);

    if (!ticker) return "Ticker is required.";
    if (!/^[A-Z.\-]{1,10}$/.test(ticker)) return "Ticker looks invalid.";
    if (!Number.isFinite(shares) || shares <= 0)
      return "Shares must be a number greater than 0.";

    // BUY-only validations
    if (modalMode === "buy") {
      if (!SECTOR_OPTIONS.includes(form.sector))
        return "Please select a valid sector.";

      const pp = Number(form.purchasePrice);
      if (!Number.isFinite(pp) || pp <= 0) {
        return "Purchase price must be a number greater than 0.";
      }
    }

    return "";
  };

  // Submit the modal: BUY calls backend; SELL does not include sector (and can be backend or no-backend)
  const submitTrade = async () => {
    if (!isAdmin) return;

    const err = validate();
    if (err) {
      setModalError(err);
      return;
    }

    const ticker = String(form.ticker).trim().toUpperCase();

    try {
      setBusy(true);
      setModalError("");

      // BUY -> POST /api/holdings with sector + purchasePrice
      if (modalMode === "buy") {
        const payload = {
          ticker,
          shares: Number(form.shares),
          sector: form.sector,
          purchasePrice: Number(form.purchasePrice),
        };

        const res = await fetch("https://ccic.onrender.com/api/holdings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }

        closeModal();
        loadHoldings();
        return;
      }

      // SELL
      if (modalMode === "sell") {
        const res = await fetch(`https://ccic.onrender.com/api/holdings/${encodeURIComponent(ticker)}`, {
           method: "PUT",
           headers: { "Content-Type": "application/json" },
           credentials: "include",
           body: JSON.stringify({ shares: Number(form.shares) }),
       });
       if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
        closeModal();
        return;
      }
    } catch (e) {
      console.error(`${modalMode} failed:`, e);
      setModalError(e?.message || "Trade failed.");
      setBusy(false);
    }
  };

  // Grid columns definition (ticker is rendered as clickable link)
  const columns = useMemo(
    () => [
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
    ],
    []
  );

  // Handle clicks on ticker links inside GridJS via event delegation
  useEffect(() => {
    const wrapper = document.getElementById("wrapper");
    if (!wrapper) return;

    const onClick = (e) => {
      const link = e.target.closest("a.ticker-link");
      if (link) {
        e.preventDefault();
        const ticker = link.getAttribute("data-ticker");
        if (ticker && onSelectTicker) onSelectTicker(ticker);
      }
    };

    wrapper.addEventListener("click", onClick);
    return () => wrapper.removeEventListener("click", onClick);
  }, [onSelectTicker]);

  // GridJS inline style overrides
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
      {/* Admin-only toolbar */}
      {isAdmin && (
        <div className="trade-toolbar">
          <button className="trade-btn trade-buy" onClick={openBuyModal}>
            Buy
          </button>
          <button className="trade-btn trade-sell" onClick={openSellModal}>
            Sell
          </button>
        </div>
      )}

      {/* Portfolio grid */}
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

      {/* Buy/Sell modal */}
      {modalOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target.classList.contains("modal-overlay")) closeModal();
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                {modalMode === "buy" ? "Buy" : "Sell"}
              </div>
              <button className="modal-x" onClick={closeModal} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="modal-body">
              <label className="modal-label">
                Ticker
                <input
                  className="modal-input"
                  value={form.ticker}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ticker: e.target.value }))
                  }
                  placeholder="AAPL"
                />
              </label>

              <label className="modal-label">
                Shares
                <input
                  className="modal-input"
                  value={form.shares}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, shares: e.target.value }))
                  }
                  placeholder="100"
                  inputMode="decimal"
                />
              </label>

              {/* BUY-only fields */}
              {modalMode === "buy" && (
                <>
                  <label className="modal-label">
                    Purchase Price
                    <input
                      className="modal-input"
                      value={form.purchasePrice}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          purchasePrice: e.target.value,
                        }))
                      }
                      placeholder="150.25"
                      inputMode="decimal"
                    />
                  </label>

                  <label className="modal-label">
                    Sector
                    <select
                      className="modal-input"
                      value={form.sector}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, sector: e.target.value }))
                      }
                    >
                      {SECTOR_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}

              {modalError && <div className="modal-error">{modalError}</div>}
            </div>

            <div className="modal-footer">
              <button className="modal-btn" onClick={closeModal} disabled={busy}>
                Cancel
              </button>
              <button
                className="modal-btn modal-btn-primary"
                onClick={submitTrade}
                disabled={busy}
              >
                {busy ? "Submitting..." : modalMode === "buy" ? "Buy" : "Sell"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Holdings;
