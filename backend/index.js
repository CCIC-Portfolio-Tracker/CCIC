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
import importOneYearValue from "./src/import_one_year_value.js";
import importSixMonthValue from "./src/import_six_month_value.js";
import importThreeMonthValue from "./src/import_three_month_value.js";
import importYTDValue from "./src/import_ytd_value.js";
import importOneYearTWR from "./src/import_one_year_twr.js";
import importSixMonthTWR from "./src/import_six_month_twr.js";
import importThreeMonthTWR from "./src/import_three_month_twr.js";
import importYTDTWR from "./src/import_ytd_twr.js";
import updatePriceAndValue from "./src/update_call.js";

const app = express();
const SQLiteStore = SQLiteStoreFactory(session); 

app.use(cors({
  origin: "https://ccic-phi.vercel.app",
  credentials: true
}));

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
await initializeOIDC();

app.get("/", (req, res) => {
  res.send("Server is ready!");
})

// updates price and value on holding start
app.post("/api/app-open", async (req, res) => {
  try {
    await updatePriceAndValue();
    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to update prices and values:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Redirects user to school login page
app.get("/api/auth/login", async (req, res) => {
  if (!config) {
    return res.status(503).send("Authentication server is still initializing. Please refresh in a moment.");
  }

  const code_verifier = oidc.randomPKCECodeVerifier();
  const state = oidc.randomState();

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
      pkceCodeVerifier: req.session.code_verifier,
      expectedState: req.session.state
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

// send a users secure session cookie info to frontend to determine auth status & login state
app.get("/api/auth/status", (req, res) => {
  if (req.session.user) {
    res.json({
      loggedIn: true,
      isAdmin: req.session.user.role === 'admin',
      isMember: req.session.user.role === 'member' || req.session.user.role === 'admin',
      userName: req.session.user.name
    });
  } else {
    res.json({ loggedIn: false, isAdmin: false, isMember: false });
  }
});

// Fetch all users for management
app.get("/api/admin/users", async (req, res) => {
  const result = await db.execute("SELECT * FROM user_table");
  res.json(result.rows);
});

// Update a user's role
app.put("/api/admin/users/:pk/role", async (req, res) => {
  await db.execute({
      sql: "UPDATE user_table SET user_role = ? WHERE user_pk = ?",
      args: [req.body.role, req.params.pk]
  });
  res.json({ ok: true });
});

// Fetch all users for management
app.get("/api/userstest", async (req, res) => {
  const result = await db.execute("SELECT * FROM user_table");
  res.json(result.rows);
});

// Update a user's role
app.put("/api/userstestupdate/:pk/role", async (req, res) => {
  await db.execute({
      sql: "UPDATE user_table SET user_role = ? WHERE user_pk = ?",
      args: [req.body.role, req.params.pk]
  });
  res.json({ ok: true });
});

// Fetch activity logs
app.get("/api/admin/activities", async (req, res) => {
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

app.get("/api/news/:ticker", async (req, res) => {
  try {
    const ticker = (req.params.ticker || "").toUpperCase();
    if(!ticker) {
      return res.status(400).json({ error: "Bad Request: Missing ticker parameter" });
    }
    const news = await getStockNews(ticker);

    res.json(news);
  } catch (error) {
    console.error("Failed to fetch news:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// for buying holdings
app.post("/api/holdings", async (req, res) => {
  try {
    const ticker = req.body.ticker.toUpperCase();
    const amount = req.body.shares;
    const sector = req.body.sector;
    const purchasePrice = req.body.purchasePrice;
    // need some way to see if the ticker already exists in the db, if so, add to existing shares instead of creating new entry
    await addHolding(ticker, amount, sector);
    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to add holding:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// for selling holdings
app.put("/api/holdings/:ticker", async (req, res) => {
  try {
    const ticker = (req.params.ticker || "").toUpperCase();
    await editHolding(ticker, req.body.shares, req.body.sector);
    // need to change so that it subtracts the shares instead of replacing them
    // can we remove sector from this call?
    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to edit holding:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
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

// send back updated total portfolio value for the past year (for graph)
app.get("/api/total-value-twr", async (req, res) => {
  try {
    const valueData = await importOneYearTWR();
    res.json(valueData);
  } catch (error) {
    console.error("Failed to fetch twr data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// send back updated total portfolio value for six months
app.get("/api/six-months-twr", async (req, res) => {
  try {
    const valueData = await importSixMonthTWR();
    res.json(valueData);
  } catch (error) {
    console.error("Failed to fetch twr data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// send back updated total portfolio value for three months
app.get("/api/three-months-twr", async (req, res) => {
  try {
    const valueData = await importThreeMonthTWR();
    res.json(valueData);
  } catch (error) {
    console.error("Failed to fetch twr data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// send back updated total portfolio value for six months
app.get("/api/ytd-twr", async (req, res) => {
  try {
    const valueData = await importYTDTWR();
    res.json(valueData);
  } catch (error) {
    console.error("Failed to fetch twr data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/news/:ticker", async (req, res) => {
  try {
    const ticker = (req.params.ticker || "").toUpperCase();
    if(!ticker) {
      return res.status(400).json({ error: "Bad Request: Missing ticker parameter" });
    }
    const news = await getStockNews(ticker);

    res.json(news);
  } catch (error) {
    console.error("Failed to fetch news:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server at http://localhost:${port}`);
})