import db from "./db.js";
import updateHoldings from "./update_holdings.js"


async function importHoldings() {
  await updateHoldings();

  const query = `
    SELECT t.ticker_text, t.ticker_co, p.price_price, h.tot_holdings
    FROM price_table p
    INNER JOIN ticker_table t ON p.ticker_fk = t.ticker_pk
    INNER JOIN holding_table h ON p.ticker_fk = h.ticker_fk
    WHERE h.tot_holdings > 0
    `;

  const result = await db.execute(query);
  const rows = result.rows;
  if (rows.length === 0) console.log("(Table is currently empty)");

  return rows.map(row => ({
    ticker: row.ticker_text,
    name: row.ticker_co,
    price: row.price_price,
    holdings: row.tot_holdings,
    totalValue: (row.price_price * row.tot_holdings).toFixed(2)
  }));

}

export default importHoldings;