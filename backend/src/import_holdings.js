import db from "./db.js";

// Imports current holdings for the database
async function importHoldings() {
  try {
    const now = new Date();
    const nyTimeString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
    const nyDate = new Date(nyTimeString);
    const dayOfWeek = nyDate.getDay();

    const cutoff = new Date(nyDate);
    cutoff.setHours(9, 30, 0, 0);

    let targetDate;

    // If its sunday or saturday, get friday data. If after 9:30 on a day, get yesterdays data
    if (dayOfWeek === 0) {
      const friday = new Date(nyDate);
      friday.setDate(nyDate.getDate() - 2);
      targetDate = friday.toLocaleDateString('en-CA');
    } 
    else if (dayOfWeek === 6) {
      const friday = new Date(nyDate);
      friday.setDate(nyDate.getDate() - 1);
      targetDate = friday.toLocaleDateString('en-CA');
    } 
    else if (dayOfWeek === 1 && nyDate < cutoff) {
      const friday = new Date(nyDate);
      friday.setDate(nyDate.getDate() - 3);
      targetDate = friday.toLocaleDateString('en-CA');
    } 
    else if (nyDate >= cutoff) {
      targetDate = nyDate.toLocaleDateString('en-CA');
    } 
    else {
      const yesterday = new Date(nyDate);
      yesterday.setDate(nyDate.getDate() - 1);
      targetDate = yesterday.toLocaleDateString('en-CA');
    }

    // get necessary data from tables
    const query = {
      sql: `
        SELECT t.ticker_text, t.ticker_co, p.price_price, p.tot_holdings, p.price_date, h.purchase_price, pf.portfolio_name
        FROM price_table p
        INNER JOIN ticker_table t ON p.ticker_fk = t.ticker_pk
        INNER JOIN holding_table h ON p.ticker_fk = h.ticker_fk
        INNER JOIN portfolio_table pf ON h.portfolio_fk = pf.portfolio_pk
        WHERE p.tot_holdings > 0 
        AND p.price_date = ?
      `,
      args: [targetDate]
    };

    const result = await db.execute(query);
    let rows = result.rows;

    // prepare data for front end
    return rows.map(row => ({
      ticker: row.ticker_text,
      name: row.ticker_co,
      price: row.price_price,
      holdings: row.tot_holdings,
      purchasePrice: row.purchase_price,
      sector: row.portfolio_name,
      totalValue: (row.price_price * row.tot_holdings).toFixed(2)
    }));

  } catch (err) {
    console.error("Error in importHoldings:", err);
    return [];
  }
}

export default importHoldings;