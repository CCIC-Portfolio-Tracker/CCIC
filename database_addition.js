const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
var sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./portfolio.db');

async function importFromTickerList() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT ticker_fk, tot_holdings FROM holding_table`, [], (err, rows) => {
            if (err) return reject(err);

            db.serialize(() => {
                const stmt = db.prepare(`INSERT OR IGNORE INTO price_table (ticker_fk, price_price, price_date, tot_holdings) VALUES (?, ?, ?, ?)`);
                const timestamp = new Date().toISOString();
                
                rows.forEach(row => {
                    stmt.run(row.ticker_fk, 0, timestamp, row.tot_holdings);
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
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.ticker_fk, t.ticker_text 
            FROM price_table p
            INNER JOIN ticker_table t ON p.ticker_fk = t.ticker_pk
        `;

        db.all(query, [], async (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return resolve();

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
        await importFromTickerList();
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