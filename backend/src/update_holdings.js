import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
import db from "./db.js";
import loadHistoricalPrices from './historical_price_update.js';

// Function to get latest date from price_table for a ticker
async function getLatestPriceDate(tickerPK) {
    const query = `SELECT price_date FROM price_table WHERE ticker_fk = ? ORDER BY price_date DESC LIMIT 1`;
    const result = await db.execute(query, [tickerPK]);
    // Safety check if no data exists
    if (result.rows.length === 0) return null;
    return result.rows[0].price_date;
}

// Main function to update prices
async function getUpdatedPrices(timestamp, histUpdate = true) {
    try {

        const checkQuery = `SELECT count(*) as count FROM price_table WHERE price_date = ?`;
        const checkResult = await db.execute(checkQuery, [timestamp]);
        
        if (checkResult.rows[0].count > 0) {
            console.log(`Prices for ${timestamp} already exist. Skipping Yahoo fetch to prevent Rate Limiting (429).`);
            return; 
        }
        
        console.log(`Starting price update for ${timestamp}...`);

        // Get all active holdings
        const query = `
            SELECT t.ticker_text, t.ticker_pk, SUM(h.tot_holdings) as tot_holdings
            FROM ticker_table t
            INNER JOIN holding_table h ON t.ticker_pk = h.ticker_fk
            WHERE h.holding_active = 1
            GROUP BY t.ticker_text, t.ticker_pk;
        `;
        const result = await db.execute(query);

        if (result.rows.length === 0) {
            console.log("No active holdings found.");
            return;
        }

        const allHoldings = result.rows;
        const uniqueTickerTexts = [...new Set(allHoldings.map(h => h.ticker_text))];

        // Get prices for unique tickers
        const quotes = await yahooFinance.quote(uniqueTickerTexts);
        const quotesArray = Array.isArray(quotes) ? quotes : [quotes];

        // Map prices
        const priceMap = new Map();
        quotesArray.forEach(q => {
            priceMap.set(q.symbol.toUpperCase(), q.regularMarketOpen);
        });

        // Delete existing entries for today in order to refresh with new data
        await db.execute({
            sql: `DELETE FROM price_table WHERE price_date = ?`,
            args: [timestamp]
        });

        // Insert fresh entries
        const batchQueries = [];

        for (const holding of allHoldings) {
            const tickerText = holding.ticker_text.toUpperCase();
            const tickerPK = holding.ticker_pk;
            const amount = holding.tot_holdings;
            const price = priceMap.get(tickerText);

            if (price !== undefined) {
                if (histUpdate) {
                    const endDateObj = new Date(timestamp);
                    endDateObj.setDate(endDateObj.getDate() - 1);
                    const endDate = endDateObj.toISOString().split('T')[0];

                    const lastDateRaw = await getLatestPriceDate(tickerPK);

                    if (lastDateRaw) {
                        const lastDateObj = new Date(lastDateRaw);
                        lastDateObj.setDate(lastDateObj.getDate() + 1);
                        const startDate = lastDateObj.toISOString().split('T')[0];

                        if (startDate <= endDate) {
                            await loadHistoricalPrices(startDate, endDate, tickerPK);
                        }
                    }
                }

                batchQueries.push({
                    sql: `INSERT INTO price_table (ticker_fk, price_price, price_date, tot_holdings) VALUES (?, ?, ?, ?)`,
                    args: [tickerPK, price, timestamp, amount]
                });

                
            } else {
                console.warn(`Could not find price for ${tickerText}`);
            }
        }

        if (batchQueries.length > 0) {
            await db.batch(batchQueries, "write");
            console.log(`Successfully updated/refreshed ${batchQueries.length} price entries for ${timestamp}.`);
        }

    } catch (error) {
        console.error("Critical error in getUpdatedPrices:", error);
        throw error;
    }
}

export default getUpdatedPrices;