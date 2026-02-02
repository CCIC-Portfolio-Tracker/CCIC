// remove?

const express = require('express');
const app = express();
const port = 5000;

// Middleware to allow your frontend to talk to your backend (CORS)
const cors = require('cors');
app.use(cors());

async function importHoldings() {

    const query = `
    SELECT t.ticker_text, t.ticker_co, p.price_price, p.tot_holdings
    FROM price_table p
    INNER JOIN ticker_table t ON p.ticker_fk = t.ticker_pk
    `;
  
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            if (err) return console.error(err.message);
            if (rows.length === 0) console.log("(Table is currently empty)");
            //console.log("PK\tTICK_FK\tPRICE\tHOLDINGS\tDATE");
            //rows.forEach(row => console.log(`${row.price_pk}\t${row.ticker_fk}\t$${row.price_price}\t${row.tot_holdings}\t${row.price_date}`));
            
            console.log("hello");
            resolve(rows);
        });
    });
  }

// THE API ENDPOINT
app.get('/api/holdings', async (req, res) => {
  try {
    const data = await importHoldings();
    res.json(data); // Sends the array back to the browser
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`Backend server running on http://localhost:${port}`));