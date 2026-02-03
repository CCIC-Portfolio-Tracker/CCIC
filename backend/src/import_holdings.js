import sqlite3 from 'sqlite3'
let db = new sqlite3.Database('./src/portfolio.db');
import updateHoldings from "./update_holdings.js"


async function importHoldings() {
  await updateHoldings();

  const query = `
    SELECT t.ticker_text, t.ticker_co, p.price_price, p.tot_holdings
    FROM price_table p
    INNER JOIN ticker_table t ON p.ticker_fk = t.ticker_pk
    INNER JOIN holding_table h ON p.ticker_fk = h.ticker_fk
    WHERE h.tot_holdings > 0
    `;

  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) return console.error(err.message);
      if (rows.length === 0) console.log("(Table is currently empty)");
      //console.log("PK\tTICK_FK\tPRICE\tHOLDINGS\tDATE");
      //rows.forEach(row => console.log(`${row.price_pk}\t${row.ticker_fk}\t$${row.price_price}\t${row.tot_holdings}\t${row.price_date}`));

      console.log("hello");
      //resolve(rows);
      const formattedHoldings = rows.map(row => ({
        ticker: row.ticker_text,
        name: row.ticker_co,
        price: row.price_price,
        holdings: row.tot_holdings,
        totalValue: (row.price_price * row.tot_holdings).toFixed(2)
      }));

      resolve(formattedHoldings);
    });
  });
}

export default importHoldings;