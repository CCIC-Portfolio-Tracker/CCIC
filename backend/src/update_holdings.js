import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
import db from "./db.js";
import loadHistoricalPrices from './historical_price_update.js';

// Function to get oldest date from price_table for a ticker
async function importOldestPriceDate(tickerPK) {
    const query = `SELECT price_date FROM price_table WHERE ticker_fk = ? ORDER BY price_date DESC LIMIT 1`;
    const result = await db.execute(query, [tickerPK]);
    console.log("Oldest price data for ticker PK", tickerPK, ":", result.rows.map(row => row.price_date));
    if (result.rows.length === 0) return null;
    return result.rows[0].price_date;
}

// Function to get all tickers from ticker_table
async function importTickerPK() {
    const query = `SELECT ticker_pk FROM ticker_table`;
    const result = await db.execute(query);
    return result.rows.map(row => row.ticker_pk);
}

// Function to check which of the tickers have not been updated today
async function checkCurrentHoldings(timestamp) {
    const tickerPKs = await importTickerPK();
    if (tickerPKs.length === 0) return [];

    const query = `
            SELECT ticker_fk, price_date
            FROM price_table
            WHERE price_date = ?
        `;

    const result = await db.execute(query, [timestamp]);
    const updatedTickerSymbols = result.rows.map(row => row.ticker_fk);

    // returns a list of outdated tickers pks that need to be updated
    return tickerPKs.filter(pk => !updatedTickerSymbols.includes(pk));
}

// Function to get the outdated tickers' text from their PKs
async function getOutdatedTickers(timestamp) {
    const outdatedTickerPKs = await checkCurrentHoldings(timestamp);
    if (outdatedTickerPKs.length === 0) {
        return { outdatedTickers: [], outdatedTickerPKs: [] };
    }

    const placeholders = outdatedTickerPKs.map(() => '?').join(',');
    const query = `
            SELECT DISTINCT t.ticker_text, t.ticker_pk, h.tot_holdings
            FROM ticker_table t
            INNER JOIN holding_table h ON t.ticker_pk = h.ticker_fk
            WHERE ticker_pk IN (${placeholders})
            AND h.holding_active = 1;
        `;

    const result = await db.execute(query, outdatedTickerPKs);
    return {
        outdatedTickers: result.rows.map(row => row.ticker_text),
        outdatedTickerPKs: result.rows.map(row => row.ticker_pk),
        currentHoldings: result.rows.map(row => row.tot_holdings)
    };
}

async function getUpdatedPrices(timestamp) {
    try {

        const { outdatedTickers, outdatedTickerPKs, currentHoldings } = await getOutdatedTickers(timestamp);

        if (!outdatedTickers || outdatedTickers.length === 0) {
            console.log(`Nothing to update for ${timestamp}.`);
            return;
        }

        // gets list of prices from yahooFinance
        const results = await yahooFinance.quote(outdatedTickers);
        const resultsArray = Array.isArray(results) ? results : [results];

        const batchQueries = [];

        for (const stock of resultsArray) {
            const index = outdatedTickers.findIndex(t => t.toUpperCase() === stock.symbol.toUpperCase());
            if (index === -1) continue;

            const matchPK = outdatedTickerPKs[index];
            const holdings = currentHoldings[index];

            const endObj = new Date(timestamp);
            endObj.setDate(endObj.getDate() - 1);
            const endDate = endObj.toISOString().split('T')[0];

            const lastRecordedDate = await importOldestPriceDate(matchPK); // Add await!
            if (lastRecordedDate) {
                const startObj = new Date(lastRecordedDate);
                startObj.setDate(startObj.getDate() + 1);
                const startDate = startObj.toISOString().split('T')[0];

                if (startDate <= endDate) {
                    console.log(`Updating ${stock.symbol} with historical backfill from ${startDate} to ${endDate}...`);
                    await loadHistoricalPrices(startDate, endDate, matchPK);
                }
            }

            if (matchPK) {
                batchQueries.push({
                    sql: `INSERT INTO price_table (ticker_fk, price_price, price_date, tot_holdings) VALUES (?, ?, ?, ?)`,
                    args: [matchPK, stock.regularMarketOpen, timestamp, holdings]
                });
            }
        }


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
