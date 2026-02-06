import express from "express";
import cors from "cors";
import importHoldings from "./src/import_holdings.js"
import getStockNews from "./src/company_news.js"
import deleteHolding from "./src/delete_holding.js"
import addHolding from "./src/add_holding.js"
import editHolding from "./src/edit_holding.js"
//import { Issuer } from 'openid-client';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3'; //
import cron from 'node-cron';
import getUpdatedPrices from "./src/update_holdings.js";
import updateTotalValue from "./src/update_total_value.js";


const app = express();
const SQLiteStore = SQLiteStoreFactory(session); //

app.use(cors());
app.use(express.json());

app.use(session({
  store: new SQLiteStore({
    db: 'sessions.sqlite', 
    dir: './' 
  }),
  secret: process.env.OIDC_CLIENT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, httpOnly: true }
}));

// Calls updates every day at 9:31 est
cron.schedule('31 09 * * 1-5', async () => {
  console.log("Running scheduled daily portfolio update at 09:31 EST...");
  try {
    // Update individual stock prices
    await getUpdatedPrices(); 
    
    // Calculate and store the new total portfolio value
    await updateTotalValue(); 
    
    console.log("Scheduled update completed successfully.");
  } catch (error) {
    console.error("Scheduled update failed:", error);
  }
}, {
  scheduled: true,
  timezone: "America/New_York" // This ensures it hits 9:31 AM EST regardless of server location
});

// Redirects user to school login page
app.get("/api/auth/login", (req, res) => {
  res.redirect(authorizationUrl); 
});

// where school sends user with a code after login
app.get("/api/auth/callback", async (req, res) => {
  res.redirect("https://ccic-portfolio-tracker.vercel.app/holdings");
});

// checks if logged in user is an admin
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: "Unauthorized: Admins only" });
};

// checks if logged in user is a member
const isMember = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'member') {
    return next();
  }
  res.status(403).json({ error: "Unauthorized: Members only" });
};


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

app.get("/api/news", async (req, res) => {
  try {
    const news = await getStockNews('AAPL');

    res.json(news);
  } catch (error) {
    console.error("Failed to fetch news:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// for adding holdings
app.post("/api/holdings", isAdmin, async (req, res) => {
  try {
    const ticker = req.body.ticker.toUpperCase();
    const amount = req.body.shares;
    const sector = req.body.sector;
    await addHolding(ticker, amount, sector);
    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to add holding:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// for editing holdings
app.put("/api/holdings/:ticker", isAdmin, (req, res) => {
  try {
    const ticker = (req.params.ticker || "").toUpperCase();
    editHolding(ticker, req.body.shares, req.body.sector);
    // can configure req.body to better fit db needs
    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to edit holding:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// for deleting holdings
app.delete("/api/holdings/:ticker", isAdmin, async (req, res) => {
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