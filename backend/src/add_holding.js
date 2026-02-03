import sqlite3 from 'sqlite3';
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });


const db = new sqlite3.Database('./src/portfolio.db');

async function addHolding(ticker, amount, sector) {
    const result = await yahooFinance.quote(ticker);

    return new Promise((resolve, reject) => {
        if (!result || result.regularMarketPrice === undefined) {
            return reject("Ticker not valid");
        }

        db.serialize(() => {
            db.run(
                `INSERT OR IGNORE INTO ticker_table (ticker_text, ticker_co, ticker_sector) VALUES (?, ?, ?)`,
                [result.symbol, result.shortName, sector],
                (err) => { if (err) return reject(err); }
            );

            db.get(
                `SELECT ticker_pk FROM ticker_table WHERE ticker_text = ?`, 
                [result.symbol], 
                (err, row) => {
                    if (err) return reject(err);
                    if (!row) return reject("Ticker ID not found.");

                    const tickerPK = row.ticker_pk;

                    const holdingQuery = `
                        INSERT INTO holding_table (ticker_fk, tot_holdings, portfolio_fk, holding_active, purchase_price)
                        VALUES (?, ?, 1, 1, ?)
                    `;

                    db.run(holdingQuery, [tickerPK, amount, result.regularMarketOpen], function(err) {
                        if (err) return reject(err);
                        
                        console.log(`Successfully added ${amount} shares of ${result.symbol}`);

                        resolve({ success: true, tickerPK });
                    });
                }
            );
        });
    });
}

// Ensure the export matches the function name
export default addHolding;