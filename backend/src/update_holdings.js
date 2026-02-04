import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
import db from "./db.js";

// Function to get all tickers from ticker_table
async function importTickerPK() {
    const query = `SELECT ticker_pk FROM ticker_table`;
    const result = await db.execute(query);
    return result.rows.map(row => row.ticker_pk);
}

// Function to check which of the tickers have not been updated today
async function checkCurrentHoldings() {
    const tickerPKs = await importTickerPK();
    if (tickerPKs.length === 0) return [];

    const query = `
            SELECT ticker_fk, price_date
            FROM price_table
            WHERE price_date = date('now')
        `;

    const result = await db.execute(query);
    const updatedTickerSymbols = result.rows.map(row => row.ticker_fk);

    // returns a list of outdated tickers pks that need to be updated
    return tickerPKs.filter(pk => !updatedTickerSymbols.includes(pk));
}

// Function to get the outdated tickers' text from their PKs
async function getOutdatedTickers() {
    const outdatedTickerPKs = await checkCurrentHoldings();
    if (outdatedTickerPKs.length === 0) {
        return { outdatedTickers: [], outdatedTickerPKs: [] };
    }

    const query = `
            SELECT t.ticker_text, t.ticker_pk, h.tot_holdings
            FROM ticker_table t
            INNER JOIN holding_table h ON t.ticker_pk = h.ticker_fk
            WHERE ticker_pk IN (${outdatedTickerPKs.join(',')});
        `;

    const result = await db.execute(query);
    return result.rows;
}

async function getUpdatedPrices() {
    try {
        const outdatedData = await getOutdatedTickers();

        if (!outdatedData || outdatedData.length === 0) {
            console.log("Nothing to update.");
            return;
        }

        const outdatedTickers = outdatedData.map(row => row.ticker_text);

        // gets list of prices from yahooFinance
        const results = await yahooFinance.quote(outdatedTickers);
        const quotes = Array.isArray(results) ? results : [results];
        const timestamp = new Date().toISOString().split('T')[0];

        const batchQueries = [];
        quotes.forEach(stock => {
            // Find the PK for this specific symbol
            const match = outdatedData.find(row => row.ticker_text === stock.symbol);

            if (match) {
                batchQueries.push({
                    sql: `INSERT INTO price_table (ticker_fk, price_price, price_date, tot_holdings) VALUES (?, ?, ?, ?)`,
                    args: [match.ticker_pk, stock.regularMarketOpen, timestamp, match.tot_holdings || 0]
                });
            }
        });


        if (batchQueries.length > 0) {
            try {
                // Turso batch() sends all inserts in one network call
                await db.batch(batchQueries, "write");
                console.log(`Successfully updated prices for ${batchQueries.length} tickers.`);
            } catch (error) {
                console.error("Batch update failed:", error);
            }
        }

    } catch (error) {
        console.error("Critical error in update_holdings:", error);
        // We re-throw so the 'await' in importHoldings knows the operation failed
        throw error;
    }


}

export default getUpdatedPrices;
