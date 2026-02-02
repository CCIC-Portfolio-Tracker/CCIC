import express from "express";
import holdings from "./src/import_holdings.js"
import news from "./src/company_news.js"

const app = express();

app.get("/", (req, res) => {
    res.send("Server is ready!");
})


app.get("/api/holdings", (req, res) => {
    res.send(holdings);
})

app.get("/api/news", (req, res) => {
    res.send(news);
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server at http://localhost:${port}`);
})