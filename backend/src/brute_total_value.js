import db from "./db.js";
import { Decimal } from 'decimal.js';

// Function to get all active tickers from ticker_table
async function importTickerPK() {
    const query = `
        SELECT t.ticker_pk 
        FROM ticker_table t
        INNER JOIN holding_table h ON t.ticker_pk = h.ticker_fk
        WHERE h.tot_holdings > 0 AND h.holding_active = 1`;
    const result = await db.execute(query);
    return result.rows.map(row => row.ticker_pk);
}

async function getTotalValue(timestamp) {
    try {
        const tickerPKs = await importTickerPK();

        if (tickerPKs.length === 0) return 0;

        const placeholders = tickerPKs.map(() => '?').join(',');

        const query = `
            SELECT p.price_price, p.price_date, h.tot_holdings
            FROM price_table p
            INNER JOIN ticker_table t ON p.ticker_fk = t.ticker_pk
            INNER JOIN holding_table h ON p.ticker_fk = h.ticker_fk
            WHERE p.ticker_fk IN (${placeholders}) AND p.price_date = ?
        `;

        const result = await db.execute(query, [...tickerPKs, timestamp]);
        
        let totalValue = new Decimal(0);

        result.rows.forEach(row => {
            const price = new Decimal(row.price_price);
            const holdings = new Decimal(row.tot_holdings);

            totalValue = totalValue.plus(price.times(holdings));
        });

        return totalValue;

    } catch (error) {
        console.error("Critical error in getTotalValue:", error);
        throw error;
    }
}

async function loadHistoricalValue() {
    try {
        let currentDate = new Date('2025-01-01');
        const endDate = new Date('2026-02-08');

        console.log("Starting historical value backfill...");

        while (currentDate <= endDate) {
            const timestamp = currentDate.toLocaleDateString('en-CA', {
                timeZone: 'America/New_York' 
            });

            console.log(`Processing: ${timestamp}`);

            const totalValue = await getTotalValue(timestamp);

            if (totalValue > 0) {
                const query = `
                    INSERT OR IGNORE INTO value_table (tot_value, value_date) 
                    VALUES (?, ?)
                `;
                await db.execute(query, [totalValue, timestamp]);
            } else {
                console.log(`No price data found for ${timestamp}, skipping.`);
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log("Total value backfill");
    } catch (error) {
        console.error("Error in loadHistoricalValue:", error);
    }
}

export default loadHistoricalValue;