
import db from "./db.js";
import { Decimal } from 'decimal.js';
import loadHistoricalValue from "./historical_value_update.js";

// Function to get oldest date from value_table for a ticker
async function getLatestValueDate() {
    const query = `SELECT value_date FROM value_table ORDER BY value_date DESC LIMIT 1`;
    const result = await db.execute(query);
    if (result.rows.length === 0) return null;    
    return result.rows[0].value_date;
}

async function checkExistingValue(timestamp) {
    const query = `
        SELECT tot_value 
        FROM value_table 
        WHERE value_date = ?
    `;
    const result = await db.execute(query, [timestamp]);
    if (result.rows.length > 0) {
        return result.rows[0].tot_value;
    }
    return 0;
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

// Main function to calculate total value for a specific date
async function getTotalValue(timestamp) {
    try {
        const currentDate = new Date(timestamp);
        currentDate.setDate(currentDate.getDate() - 1);
        const endDate = currentDate.toISOString().split('T')[0];
        
        const latestDate = await getLatestValueDate();

        if (latestDate) {
            const startDate = new Date(latestDate).toLocaleDateString('en-CA');
            console.log(`Calculating total value for ${timestamp} with historical backfill from ${startDate} to ${endDate}...`);
            
            if (startDate <= endDate) {
                console.log("Gap in value history detected. Initiating backfill...");
                await loadHistoricalValue(startDate, endDate);
           }
        } else {
            console.log("No previous value history found. Skipping backfill to prevent history rewriting.");
        }

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

// update total value for a specific date, if it already exists, update it, if not, insert it
async function updateTotalValue(timestamp) {

    console.log("time:", timestamp);

    const totalValue = await getTotalValue(timestamp);

    if (await checkExistingValue(timestamp) > 0) {
        console.log("Value for this date already exists. Checking update necessity...");
        const query = `
        UPDATE value_table SET tot_value = ? WHERE value_date = ?
        `;
        await db.execute(query, [totalValue, timestamp]);
    } else {

        const query = `
        INSERT or IGNORE INTO value_table (tot_value, value_date) VALUES (?, '${timestamp}')
    `;

        await db.execute(query, [totalValue]);
    }
}

export default updateTotalValue;