import express from "express";
import cors from "cors";
import importHoldings from "./src/import_holdings.js"
import getStockNews from "./src/company_news.js"
import deleteHolding from "./src/delete_holding.js"
import addHolding from "./src/add_holding.js"
import editHolding from "./src/edit_holding.js"
import { Issuer, custom } from 'openid-client';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3'; //
import cron from 'node-cron';
import getUpdatedPrices from "./src/update_holdings.js";
import updateTotalValue from "./src/update_total_value.js";

let client;
const discoverIssuer = async () => {
  const schoolIssuer = await Issuer.discover('https://cas.coloradocollege.edu/cas/oidc');
  client = new schoolIssuer.Client({
    client_id: process.env.OIDC_CLIENT_ID,
    client_secret: process.env.OIDC_CLIENT_SECRET,
    redirect_uris: ['http://localhost:3000/api/auth/callback'],
    response_types: ['code'],
  });
};

discoverIssuer();

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
  const url = client.authorizationUrl({ scope: 'openid profile email' });
  res.redirect(url);
});

// where school sends user with a code after login
app.get("/api/auth/callback", async (req, res) => {
  const params = client.callbackParams(req);
  try {
    const tokenSet = await client.callback('http://localhost:3000/api/auth/callback', params);
    const userClaims = tokenSet.claims();

    // Check if user exists in your Turso database
    let userResult = await db.execute({
        sql: "SELECT * FROM user_table WHERE user_oidc_sub = ?",
        args: [userClaims.sub]
    });

    // Register new users automatically
    if (userResult.rows.length === 0) {
        await db.execute({
            sql: "INSERT INTO user_table (user_oidc_sub, user_name, user_role) VALUES (?, ?, 'viewer')",
            args: [userClaims.sub, userClaims.name || userClaims.email, 'viewer']
        });
        userResult = await db.execute({
            sql: "SELECT * FROM user_table WHERE user_oidc_sub = ?",
            args: [userClaims.sub]
        });
    }

    const userData = userResult.rows[0];
    req.session.user = {
      pk: userData.user_pk,
      name: userData.user_name,
      role: userData.user_role // Persistent role (admin, member, or viewer)
    };

    res.redirect("https://ccic-portfolio-tracker.vercel.app/holdings");
  } catch (err) {
    res.status(500).send('Authentication failed');
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


app.get("/", (req, res) => {
  res.send("Server is ready!");
})

// Fetch all users for management
app.get("/api/admin/users", isAdmin, async (req, res) => {
  const result = await db.execute("SELECT * FROM user_table");
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