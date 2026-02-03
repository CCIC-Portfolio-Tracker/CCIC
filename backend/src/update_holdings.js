import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('./src/portfolio.db');

// Function to get all tickers from ticker_table
async function importTickerPK() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT ticker_pk
            FROM ticker_table
        `;

        db.all(query, [], async (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) {
                console.log("(Ticker table is currently empty)");
                return resolve();
            }
            const tickerSymbols = rows.map(row => row.ticker_pk);

            // returns a list of all tickers in ticker_table
            resolve(tickerSymbols);
        });
    });
}

// Function to check which of the tickers have not been updated today
async function checkCurrentHoldings() {
    const tickerPKs = await importTickerPK();

    return new Promise((resolve, reject) => {
        const query = `
            SELECT ticker_fk, price_date
            FROM price_table
            WHERE price_date = date('now')
        `;

        db.all(query, [], async (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) {
                console.log("(Price table is currently empty)");
                resolve(tickerPKs);
            }
            const updatedTickerSymbols = rows.map(row => row.ticker_fk);
            const outdatedTickerPKs = tickerPKs.filter(pk => !updatedTickerSymbols.includes(pk));

            // returns a list of outdated tickers pks that need to be updated
            resolve(outdatedTickerPKs);
        });
    });
}

// Function to get the outdated tickers' text from their PKs
async function getOutdatedTickers() {
    const outdatedTickerPKs = await checkCurrentHoldings();

    return new Promise((resolve, reject) => {
        const query = `
            SELECT ticker_text
            FROM ticker_table
            WHERE ticker_pk IN (${outdatedTickerPKs});
        `;

        db.all(query, [], async (err, rows) => {
            if (err) return reject(err);
            if (!rows || rows.length === 0) {
                console.log("(All tickers are up to date)");
                return resolve({ outdatedTickers: [], outdatedTickerPKs: [] });
            }
            const outdatedTickers = rows.map(row => row.ticker_text);

            // returns a list of outdated tickers that need to be updated and their pks 
            resolve({ outdatedTickers: outdatedTickers, outdatedTickerPKs: outdatedTickerPKs });
        });
    }); o
}

async function getUpdatedPrices() {
    const { outdatedTickers, outdatedTickerPKs } = await getOutdatedTickers();

    if (!outdatedTickers || outdatedTickers.length === 0) {
        console.log("Nothing to update.");
        await printTable();
        return;
    }

    // gets list of prices from yahooFinance
    const results = await yahooFinance.quote(outdatedTickers);

    const timestamp = new Date().toISOString().split('T')[0];

    const query = `
            SELECT t.ticker_pk, t.ticker_text, h.tot_holdings
            FROM holding_table h
            INNER JOIN ticker_table t ON h.ticker_fk = t.ticker_pk
            WHERE t.ticker_pk IN (${outdatedTickerPKs});
        `;

    await new Promise((resolve, reject) => {
        db.all(query, [], async (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) {
                console.log("Everything is already up to date.");
                return resolve();
            }

            db.serialize(() => {
                const stmt = db.prepare(`
                INSERT INTO price_table (ticker_fk, price_price, price_date)
                VALUES (?, ?, ?)
            `);

                results.forEach(stock => {
                    const match = rows.find(r => r.ticker_text === stock.symbol);

                    if (match) {
                        stmt.run(
                            match.ticker_pk,
                            stock.regularMarketPrice,
                            timestamp
                        );
                    }
                });

                stmt.finalize((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    });

    await printTable();

}

async function printTable() {
    console.log("\n--- Price Table ---");
    db.all(`SELECT * FROM price_table`, [], (err, rows) => {
        if (err) return console.error(err.message);
        if (rows.length === 0) console.log("(Table is currently empty)");
        console.log("PK\tTICK_FK\tPRICE\tHOLDINGS\tDATE");
        rows.forEach(row => console.log(`${row.price_pk}\t${row.ticker_fk}\t$${row.price_price}\t${row.tot_holdings}\t${row.price_date}`));

    });
}

export default getUpdatedPrices;
