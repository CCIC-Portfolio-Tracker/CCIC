import db from "./db.js";
import getUpdatedPrices from "./update_holdings.js";

async function importHoldings() {
  try {
    const now = new Date();
    const nyTimeString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
    const nyDate = new Date(nyTimeString);
    const dayOfWeek = nyDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    const cutoff = new Date(nyDate);
    cutoff.setHours(9, 30, 0, 0);

    let targetDate;

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

    // Fallback if no data exists for the specific calculated date
    if (rows.length === 0) {
      const fallbackQuery = `
        SELECT t.ticker_text, t.ticker_co, p.price_price, p.tot_holdings, p.price_date
        FROM price_table p
        INNER JOIN ticker_table t ON p.ticker_fk = t.ticker_pk
        WHERE p.tot_holdings > 0 
        AND p.price_date = (SELECT MAX(price_date) FROM price_table)
      `;
      const fallbackResult = await db.execute(fallbackQuery);
      rows = fallbackResult.rows;
    }

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