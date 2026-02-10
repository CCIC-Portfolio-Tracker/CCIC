import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
import db from "./db.js";

async function loadHistoricalPrices() {
    try {
        // 1. Get all tickers and their current holdings
        const tickerData = await db.execute(`
            SELECT t.ticker_pk, t.ticker_text, h.tot_holdings 
            FROM ticker_table t
            INNER JOIN holding_table h ON t.ticker_pk = h.ticker_fk
        `);

        // 2. Define the date range using explicit Date objects
        const startDate = new Date('2025-02-09');
        const endDate = new Date(); // Today

        console.log(`Starting historical backfill for ${tickerData.rows.length} tickers...`);

        for (const row of tickerData.rows) {
            const { ticker_pk, ticker_text, tot_holdings } = row;

            try {
                // 3. Fetch historical data with explicit period2 to avoid validation errors
                const results = await yahooFinance.historical(ticker_text, {
                    period1: startDate,
                    period2: endDate, 
                    interval: '1d'
                });

                if (!results || results.length === 0) {
                    console.log(`Warning: No historical data found for ${ticker_text}`);
                    continue;
                }

                // 4. Map results and filter out null prices (holidays/weekends)
                const batchQueries = results
                    .filter(day => day.open != null) 
                    .map(day => {
                        const formattedDate = new Date(day.date).toLocaleDateString('en-CA');
                        
                        return {
                            sql: `INSERT OR IGNORE INTO price_table 
                                  (ticker_fk, price_price, price_date, tot_holdings) 
                                  VALUES (?, ?, ?, ?)`,
                            args: [ticker_pk, day.open, formattedDate, tot_holdings]
                        };
                    });

                // 5. Batch insert into the database
                if (batchQueries.length > 0) {
                    await db.batch(batchQueries, "write");
                    console.log(`Loaded ${batchQueries.length} entries for ${ticker_text}`);
                }

            } catch (yahooError) {
                // If a specific ticker fails (e.g. symbol mismatch), log and continue
                console.error(`Skipping ${ticker_text}: ${yahooError.message}`);
            }
        }

        console.log("Historical price table backfill complete.");
    } catch (err) {
        console.error("Critical error in loadHistoricalPrices:", err);
    }
}

export default loadHistoricalPrices;