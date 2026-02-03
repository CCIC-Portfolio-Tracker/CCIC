import express from "express";
import importHoldings from "./src/import_holdings.js"
import news from "./src/company_news.js"
import deleteHolding from "./src/delete_holding.js"

const app = express();
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Server is ready!");
})

app.get("/api/holdings", async (req, res) => {
  try {
    const holdings = await importHoldings();

    res.json(holdings);
  } catch (error) {
    console.error("Failed to fetch holdings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/news", (req, res) => {
  res.send(news);
})

// for adding holdings
app.post("/api/holdings", (req, res) => {
  console.log("Got new holding:", req.body);
  res.json({ ok: true });
});

// for editing holdings
app.put("/api/holdings/:ticker", (req, res) => {
  const ticker = (req.params.ticker || "").toUpperCase();
  console.log("edit ticker:", ticker, "updates:", req.body);
  // can configure req.body to better fit db needs
  res.json({ ok: true });
});

// for deleting holdings
app.delete("/api/holdings/:ticker", async (req, res) => {
  try {
    const ticker = (req.params.ticker || "").toUpperCase();
    console.log("delete ticker:", ticker);
    await deleteHolding(ticker);
    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete holding:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }


});


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server at http://localhost:${port}`);
})