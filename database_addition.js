const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
var sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./portfolio.db');

async function isPriceTableEmpty() {
    return new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) AS count FROM price_table`, [], (err, row) => {
            if (err) reject(err);
            else resolve(row.count === 0);
        });
    });
}

async function importFromTickerList(tickerList) {
    return new Promise((resolve, reject) => {
        if (!tickerList || tickerList.length === 0) return resolve();

        const placeholders = tickerList.map(() => '?').join(',');

        const query = `
            SELECT h.ticker_fk, h.tot_holdings, t.ticker_text
            FROM holding_table h
            INNER JOIN ticker_table t ON h.ticker_fk = t.ticker_pk
            WHERE t.ticker_text IN (${placeholders})`;

        db.all(query, tickerList, (err, rows) => {
            if (err) return reject(err);

            db.serialize(() => {
                const stmt = db.prepare(`INSERT OR IGNORE INTO price_table (ticker_fk, price_price, price_date, tot_holdings) VALUES (?, ?, ?, ?)`);
               
                const fillerDate = '1970-01-01';
               
                rows.forEach(row => {
                    stmt.run(row.ticker_fk, 0, fillerDate, row.tot_holdings);
                });

                stmt.finalize((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    });
}

async function updateAllStocks() {
    const isEmpty = await isPriceTableEmpty();

    if (isEmpty) {
        console.log("Price table is empty. Initializing...");
        const allTickers = await new Promise((resolve, reject) => {
            db.all(`SELECT ticker_text FROM ticker_table`, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(r => r.ticker_text));
            });
        });
        await importFromTickerList(allTickers);
    }

    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.ticker_fk, t.ticker_text
            FROM price_table p
            INNER JOIN ticker_table t ON p.ticker_fk = t.ticker_pk
            WHERE p.price_date < date('now') OR p.price_date = '1970-01-01'
        `;

        db.all(query, [], async (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) {
                console.log("Everything is already up to date.");
                return resolve();
            }

            const tickerSymbols = rows.map(row => row.ticker_text);

            try {
                const results = await yahooFinance.quote(tickerSymbols);
                const date = new Date();
                const timestamp = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                });

                db.serialize(() => {
                    const stmt = db.prepare(`
                        UPDATE price_table
                        SET price_price = ?, price_date = ?
                        WHERE ticker_fk = (SELECT ticker_pk FROM ticker_table WHERE ticker_text = ?)
                    `);
                   
                    results.forEach(stock => {
                        stmt.run(stock.regularMarketOpen, timestamp, stock.symbol);
                    });

                    stmt.finalize(() => resolve());
                });
            } catch (error) {
                reject(error);
            }
        });
    });
}

async function runQueries() {
    try {
        await updateAllStocks();

        console.log("\n--- Final Updated Portfolio ---");
       
        const finalQuery = `
            SELECT t.ticker_text, t.ticker_co, p.price_price, p.tot_holdings
            FROM price_table p
            INNER JOIN ticker_table t ON p.ticker_fk = t.ticker_pk
        `;

        db.all(finalQuery, [], (err, rows) => {
            if (err) throw err;
            console.log("TICKER\tNAME".padEnd(35) + "PRICE\tHOLDINGS");
            console.log("------------------------------------------------------------");
            rows.forEach(row => {
                const tickerLine = `${row.ticker_text}\t${row.ticker_co}`.padEnd(35);
                console.log(`${tickerLine}$${row.price_price.toFixed(2)}\t${row.tot_holdings}`);
            });
            db.close();
        });
    } catch (err) {
        console.error("Error during execution:", err);
    }
}

runQueries();
