import express from "express";
import users from "./user.js"
import holdings from "./src/import_holdings.js"

const app = express();

app.get("/", (req, res) => {
    res.send("Server is ready!");
})

/*
app.get("/api/user", (req, res) => {
    res.send(users);
})
    */

app.get("/api/user", (req, res) => {
    res.send(holdings);
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server at http://localhost:${port}`);
})