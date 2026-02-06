import db from "./db.js";

async function importHoldings() {
  try {
    
    const timestamp = new Date().toLocaleDateString('en-CA')

    const query = `
    SELECT t.ticker_text, t.ticker_co, p.price_price, p.tot_holdings, p.price_date
    FROM price_table p
    INNER JOIN ticker_table t ON p.ticker_fk = t.ticker_pk
    INNER JOIN holding_table h ON p.ticker_fk = h.ticker_fk
    WHERE p.tot_holdings > 0 AND p.price_date = ?
    `;

    const result = await db.execute(query, [timestamp]);
    const rows = result.rows;
    if (rows.length === 0) console.log("(Table is currently empty)");

    return rows.map(row => ({
      ticker: row.ticker_text,
      name: row.ticker_co,
      price: row.price_price,
      holdings: row.tot_holdings,
      totalValue: (row.price_price * row.tot_holdings).toFixed(2)
    }));

  } catch (err) {
    console.error("Error in importHoldings:", err);
    return [];
  }

}

export default importHoldings;