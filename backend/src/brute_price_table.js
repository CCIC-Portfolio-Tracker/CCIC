import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
import db from "./db.js";

async function load2025Price(startDate, endDate) {
    try {
        const tickerData = await db.execute(`
            SELECT t.ticker_pk, t.ticker_text, h.tot_holdings 
            FROM ticker_table t
            INNER JOIN holding_table h ON t.ticker_pk = h.ticker_fk
        `);

        console.log(`Starting historical backfill for ${tickerData.rows.length} tickers...`);

        for (const row of tickerData.rows) {
            const { ticker_pk, ticker_text, tot_holdings } = row;

            try {
                const results = await yahooFinance.historical(ticker_text, {
                    period1: startDate,
                    period2: endDate, 
                    interval: '1d'
                });

                if (!results || results.length === 0) {
                    console.log(`Warning: No historical data found for ${ticker_text}`);
                    continue;
                }

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

                if (batchQueries.length > 0) {
                    await db.batch(batchQueries, "write");
                    console.log(`Loaded ${batchQueries.length} entries for ${ticker_text}`);
                }

            } catch (yahooError) {
                console.error(`Skipping ${ticker_text}: ${yahooError.message}`);
            }
        }

        console.log("Historical price table backfill complete.");
    } catch (err) {
        console.error("Critical error in loadHistoricalPrices:", err);
    }
}

export default loadHistoricalPrices;