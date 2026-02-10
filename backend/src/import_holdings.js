import db from "./db.js";
import getUpdatedPrices from "./update_holdings.js";

async function importHoldings() {
  try {
    const now = new Date();
    const nyTimeString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
    const nyDate = new Date(nyTimeString);

    const cutoff = new Date(nyDate);
    cutoff.setHours(9, 30, 0, 0);

    let targetDate;

    if (nyDate >= cutoff) {
      targetDate = nyDate.toLocaleDateString('en-CA');
    } else {
      const yesterday = new Date(nyDate);
      yesterday.setDate(yesterday.getDate() - 1);
      targetDate = yesterday.toLocaleDateString('en-CA');
    }

    await getUpdatedPrices(targetDate);

    const query = {
      sql: `
        SELECT t.ticker_text, t.ticker_co, p.price_price, p.tot_holdings, p.price_date
        FROM price_table p
        INNER JOIN ticker_table t ON p.ticker_fk = t.ticker_pk
        WHERE p.tot_holdings > 0 
        AND p.price_date = ?
      `,
      args: [targetDate]
    };

    const result = await db.execute(query);
    let rows = result.rows;

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