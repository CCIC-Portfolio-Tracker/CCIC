
import db from "./db.js";
import { Decimal } from 'decimal.js';
import loadHistoricalValue from "./historical_value_update.js";

// Function to get oldest date from value_table for a ticker
async function importOldestValueDate() {
    const query = `SELECT value_date FROM value_table ORDER BY value_date DESC LIMIT 1`;
    const result = await db.execute(query);
    console.log("Oldest value date:", result.rows.map(row => row.value_date));
    return result.rows.map(row => row.value_date);
}

async function checkExistingValue(timestamp) {
    const query = `
        SELECT tot_value 
        FROM value_table 
        WHERE value_date = ?
    `;
    const result = await db.execute(query, [timestamp]);
    console.log(`Existing value check for ${timestamp}:`, result.rows);
    return result.rows.totalValue;
}

// Function to get all active tickers from ticker_table
async function importTickerPK() {
    const query = `
        SELECT t.ticker_pk 
        FROM ticker_table t
        INNER JOIN holding_table h ON t.ticker_pk = h.ticker_fk
        WHERE h.tot_holdings > 0 AND h.holding_active = 1`;
    const result = await db.execute(query);
    console.log("Imported ticker PKs:", result.rows);
    return result.rows.map(row => row.ticker_pk);
}

async function getTotalValue(timestamp) {
    try {

        const oldestDate = importOldestValueDate();
        const startDate = new Date(oldestDate).toLocaleDateString('en-CA');
        const endDate = timestamp - 1;
        console.log(`Calculating total value for ${timestamp} with historical backfill from ${startDate} to ${endDate}...`);
        await loadHistoricalValue(startDate, endDate);

        const tickerPKs = await importTickerPK();

        if (tickerPKs.length === 0) return 0;

        const placeholders = tickerPKs.map(() => '?').join(',');

        const query = `
            SELECT p.price_price, p.price_date, h.tot_holdings
            FROM price_table p
            INNER JOIN holding_table h ON p.ticker_fk = h.ticker_fk
            WHERE p.ticker_fk IN (${placeholders}) AND p.price_date = ?
            AND h.holding_active = 1 AND h.tot_holdings > 0
        `;

        const result = await db.execute(query, [...tickerPKs, timestamp]);
        let totalValue = new Decimal(0);

        result.rows.forEach(row => {
            const price = new Decimal(row.price_price);
            const holdings = new Decimal(row.tot_holdings);

            const addPrice = price.times(holdings);

            totalValue = totalValue.plus(addPrice);

        });

        console.log(`Total value for ${timestamp}:`, totalValue.toFixed(2));

        return totalValue;

    } catch (error) {
        console.error("Critical error in getTotalValue:", error);
        throw error;
    }
}

async function updateTotalValue(timestamp) {

    console.log("time:", timestamp);

    const totalValue = await getTotalValue(timestamp);

    if (await checkExistingValue(timestamp) > 0) {
        console.log("Value for this date already exists. Checking update necessity...");
        const query = `
        UPDATE value_table (tot_value) VALUES (?) WHERE value_date = '${timestamp}'
        `;
        await db.execute(query, [totalValue]);
        return;
    } else {

        const query = `
        INSERT or IGNORE INTO value_table (tot_value, value_date) VALUES (?, '${timestamp}')
    `;

        await db.execute(query, [totalValue]);
    }
}

export default updateTotalValue;