import express from "express";
import holdings from "./src/import_holdings.js"
import news from "./src/company_news.js"

const app = express();
app.use(express.json());


app.get("/", (req, res) => {
    res.send("Server is ready!");
})


app.get("/api/holdings", (req, res) => {
    res.send(holdings);
})

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
 app.delete("/api/holdings/:ticker", (req, res) => {
    const ticker = (req.params.ticker || "").toUpperCase();
    console.log("delete ticker:", ticker);
    res.json({ ok: true });
  });


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server at http://localhost:${port}`);
})