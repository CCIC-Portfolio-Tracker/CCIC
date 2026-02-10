import express from "express";
import cors from "cors";
import db from "./src/db.js";
import importHoldings from "./src/import_holdings.js"
import getStockNews from "./src/company_news.js"
import deleteHolding from "./src/delete_holding.js"
import addHolding from "./src/add_holding.js"
import editHolding from "./src/edit_holding.js"
import * as oidc from 'openid-client';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3'; 
import cron from 'node-cron';
import getUpdatedPrices from "./src/update_holdings.js";
import updateTotalValue from "./src/update_total_value.js";
import importOneYearValue from "./src/import_one_year_value.js";
import importSixMonthValue from "./src/import_six_month_value.js";
import importThreeMonthValue from "./src/import_three_month_value.js";
import importYTDValue from "./src/import_ytd_value.js";
import crypto from 'crypto';

const app = express();
const SQLiteStore = SQLiteStoreFactory(session); 

app.use(cors({
  origin: "https://ccic-phi.vercel.app",
  credentials: true
}));

app.set("trust proxy", 1);

app.use(express.json());

// stops memory leaks, creates secure session cookie for users
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.sqlite', 
    dir: './' 
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, 
  cookie: { 
    secure: true,      
    httpOnly: true, 
    sameSite: 'none',  
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

// connects with CC CAS to get necessary data like authorized endpoint
let config;
let state;
let code_verifier;
const initializeOIDC = async () => {
  try {
    const issuerURL = new URL(process.env.OIDC_ISSUER_URL);
    config = await oidc.discovery(
      issuerURL,
      process.env.OIDC_CLIENT_ID,
      process.env.OIDC_CLIENT_SECRET
    );
    console.log("OIDC Discovery successful");
  } catch (err) {
    console.error("OIDC Init Error:", err);
  }
};
initializeOIDC();

console.log(config);

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

app.get("/", (req, res) => {
  res.send("Server is ready!");
})

// Redirects user to school login page
app.get("/api/auth/login", async (req, res) => {
  if (!config) {
    return res.status(503).send("Authentication server is still initializing. Please refresh in a moment.");
  }

  code_verifier = oidc.randomPKCECodeVerifier();
  state = oidc.randomState();

  req.session.code_verifier = code_verifier;
  req.session.state = state;

  const code_challenge = await oidc.calculatePKCECodeChallenge(code_verifier)
  
  let parameters =  {
    redirect_uri: process.env.OIDC_REDIRECT_URI,
    scope: 'openid profile email',
    state: state,
    code_challenge: code_challenge,
    code_challenge_method: 'S256',
  };

  const url = oidc.buildAuthorizationUrl(config, parameters);

  res.redirect(url.href);
});

// where school sends user with a code after login, sends school code and client secret to get necessary information
app.get("/api/auth/callback", async (req, res) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.get('host');
    const currentUrl = new URL(`${protocol}://${host}${req.originalUrl}`);

    const tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: code_verifier,
      expectedState: state
    });
    const claims = tokens.claims();
    console.log("Logged in user:", claims.sub);

    // check if user exists in table
    let userResult = await db.execute({
      sql: "SELECT * FROM user_table WHERE user_oidc_sub = ?",
      args: [claims.sub]
    });

    // if new user, register them as 'viewer'
    if (userResult.rows.length === 0) {
      await db.execute({
        sql: "INSERT INTO user_table (user_oidc_sub, user_name, user_role) VALUES (?, ?, 'viewer')",
        args: [claims.sub, claims.name || claims.email]
      });

      // refetch to get the user_pk
      userResult = await db.execute({
        sql: "SELECT * FROM user_table WHERE user_oidc_sub = ?",
        args: [claims.sub]
      });
    }

    const userData = userResult.rows[0];

    req.session.user = {
      pk: userData.user_pk,
      name: userData.user_name,
      role: userData.user_role 
    };

    res.redirect("https://ccic-phi.vercel.app");
  } catch (err) {
    console.error("Callback Error:", err);
    res.status(500).send("Authentication failed");
  }
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

// Fetch all users for management
app.get("/api/admin/users", isAdmin, async (req, res) => {
  const result = await db.execute(`
    SELECT user_pk, user_name, user_role
    FROM user_table
    ORDER BY user_name
  `);
  res.json(result.rows);
});

// Update a user's role
app.put("/api/admin/users/:pk/role", isAdmin, async (req, res) => {
  await db.execute({
      sql: "UPDATE user_table SET user_role = ? WHERE user_pk = ?",
      args: [req.body.role, req.params.pk]
  });
  res.json({ ok: true });
});

// sends user info to the frontend
app.get("/api/auth/status", (req, res) => {
  const user = req.session?.user;
  res.json({
    loggedIn: !!user,
    role: user?.role ?? null,
    isAdmin: user?.role === "admin",
    name: user?.name ?? null
  });
});

// Fetch activity logs
app.get("/api/admin/activities", isAdmin, async (req, res) => {
  const result = await db.execute(`
      SELECT a.*, u.user_name, t.ticker_text 
      FROM activity_table a 
      JOIN user_table u ON a.user_fk = u.user_pk 
      LEFT JOIN ticker_table t ON a.ticker_fk = t.ticker_pk 
      ORDER BY log_timestamp DESC
  `);
  res.json(result.rows);
});

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
    await addHolding(ticker, amount, sector, req.session.user.pk);
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

// send back updated total portfolio value for the past year (for graph)
app.get("/api/total-value", async (req, res) => {
  try {
    const valueData = await importOneYearValue();
    res.json(valueData);
  } catch (error) {
    console.error("Failed to fetch total value data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// send back updated total portfolio value for six months
app.get("/api/six-months", async (req, res) => {
  try {
    const valueData = await importSixMonthValue();
    res.json(valueData);
  } catch (error) {
    console.error("Failed to fetch total value data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// send back updated total portfolio value for three months
app.get("/api/three-months", async (req, res) => {
  try {
    const valueData = await importThreeMonthValue();
    res.json(valueData);
  } catch (error) {
    console.error("Failed to fetch total value data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// send back updated total portfolio value for six months
app.get("/api/ytd", async (req, res) => {
  try {
    const valueData = await importYTDValue();
    res.json(valueData);
  } catch (error) {
    console.error("Failed to fetch total value data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server at http://localhost:${port}`);
})