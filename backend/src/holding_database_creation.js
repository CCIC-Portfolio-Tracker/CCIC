var sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./portfolio.db');

async function importFromTickerList() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT ticker_pk FROM ticker_table`, [], (err, rows) => {
            if (err) return reject(err);

            db.serialize(() => {
                const stmt = db.prepare(`INSERT OR IGNORE INTO stock (stock_ticker, stock_name, stock_price, stock_holdings) VALUES (?, ?, ?, ?)`);
                
                rows.forEach(row => {
                    stmt.run(row.stock_ticker, row.stock_name, 0, row.stock_holdings);
                });

                stmt.finalize((err) => {
                    if (err) reject(err);
                    else {
                        resolve();
                    }
                });
            });
        });
    });
}