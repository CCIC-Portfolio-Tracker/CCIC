import db from "./db.js";
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

import { getNextProxyOptions } from "./proxy_rotator.js";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function loadHistoricalPrices(startDate, endDate, tickerPK) {
    try {
        const tickerData = await db.execute(`
            SELECT t.ticker_text, SUM(h.tot_holdings) as tot_holdings
            FROM ticker_table t
            INNER JOIN holding_table h ON t.ticker_pk = h.ticker_fk
            WHERE t.ticker_pk = ?
            GROUP BY t.ticker_text
        `, [tickerPK]);

        if (tickerData.rows.length === 0) return;

        console.log(`Starting historical backfill for ${tickerData.rows.length} tickers...`);

        const ticker_text = tickerData.rows[0].ticker_text;
        const tot_holdings = tickerData.rows[0].tot_holdings;

        const yahooEndDate = new Date(endDate);
        yahooEndDate.setDate(yahooEndDate.getDate());
        const period2Str = yahooEndDate.toISOString().split('T')[0];

        let results = [];
        let fetchSuccess = false;
        let attempts = 0;
        const maxAttempts = 6; 

        while (!fetchSuccess && attempts < maxAttempts) {
            const proxyOptions = getNextProxyOptions();

            try {
                results = await yahooFinance.historical(ticker_text, {
                    period1: startDate,
                    period2: period2Str,
                    interval: '1d'
                }, proxyOptions);
                
                fetchSuccess = true; 
                console.log(`Historical fetch for ${ticker_text} successful on attempt ${attempts + 1}!`);

            } catch (yahooError) {
                console.warn(`[Attempt ${attempts + 1}] Historical proxy hit a 429 Ban for ${ticker_text}. Rotating...`);
                attempts++;
                await sleep(1500); 
            }
        }

        if (!fetchSuccess) {
            console.error(`All proxy attempts failed for ${ticker_text}. Skipping historical backfill.`);
            return;
        }

        if (!results || results.length === 0) {
            console.log(`Warning: No historical data found for ${ticker_text}`);
            return;
        }

        const batchQueries = [];

        results.filter(day => day.open != null).forEach(day => {
            const formattedDate = new Date(day.date).toLocaleDateString('en-CA');

            batchQueries.push({
                sql: `INSERT OR IGNORE INTO price_table 
                          (ticker_fk, price_price, price_date, tot_holdings) 
                          VALUES (?, ?, ?, ?)`,
                args: [tickerPK, day.open, formattedDate, tot_holdings]
            });
        });

        if (batchQueries.length > 0) {
            await db.batch(batchQueries, "write");
            console.log(`Loaded ${batchQueries.length} entries for ${ticker_text}`);
        }

        console.log("Historical price table backfill complete.");
    } catch (err) {
        console.error("Critical error in loadHistoricalPrices:", err);
    }
}

export default loadHistoricalPrices;