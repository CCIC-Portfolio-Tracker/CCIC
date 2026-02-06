
import db from "./db.js";

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

async function getTotalValue() {
    try {
        const tickerPKs = await importTickerPK();

        const timestamp = new Date().toISOString().split('T')[0];

        const query = `
            SELECT p.price_price, p.price_date, h.tot_holdings
            FROM price_table p
            INNER JOIN ticker_table t ON p.ticker_fk = t.ticker_pk
            INNER JOIN holding_table h ON p.ticker_fk = h.ticker_fk
            WHERE p.ticker_fk IN (${tickerPKs.join(',')}) AND p.price_date = ${timestamp}
        `;

        const result = await db.execute(query);
        let totalValue = 0;

        result.rows.forEach(row => {
            totalValue += row.price_price * row.tot_holdings;
        });

        return totalValue;

    } catch (error) {
        console.error("Critical error in getTotalValue:", error);
        throw error;
    }
}

async function updateTotalValue() {
    const totalValue = await getTotalValue();

    const timestamp = new Date().toISOString().split('T')[0];

    const query = `
        INSERT INTO value_table (tot_value, value_date) VALUES (?, '${timestamp}')
    `;

    await db.execute(query, [totalValue]);
}

export default updateTotalValue;
