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
            SELECT ticker_text
            FROM ticker_table
            WHERE ticker_pk IN (${outdatedTickerPKs});
        `;

    const result = await db.execute(query);
    return {
        outdatedTickers: result.rows.map(row => row.ticker_text),
        outdatedTickerPKs: result.rows.map(row => row.ticker_pk)
    };
}

async function getUpdatedPrices() {
    const { outdatedTickers, outdatedTickerPKs } = await getOutdatedTickers();

    if (!outdatedTickers || outdatedTickers.length === 0) {
        console.log("Nothing to update.");
        return;
    }

    // gets list of prices from yahooFinance
    const results = await yahooFinance.quote(outdatedTickers);
    const timestamp = new Date().toISOString().split('T')[0];

    const batchQueries = [];
    results.forEach(stock => {
        // Find the PK for this specific symbol
        const matchPK = outdatedTickerPKs[outdatedTickers.indexOf(stock.symbol)];

        if (matchPK) {
            batchQueries.push({
                sql: `INSERT INTO price_table (ticker_fk, price_price, price_date) VALUES (?, ?, ?)`,
                args: [matchPK, stock.regularMarketPrice, timestamp]
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


}

/*
async function printTable() {
    console.log("\n--- Price Table ---");
    db.all(`SELECT * FROM price_table`, [], (err, rows) => {
        if (err) return console.error(err.message);
        if (rows.length === 0) console.log("(Table is currently empty)");
        console.log("PK\tTICK_FK\tPRICE\tHOLDINGS\tDATE");
        rows.forEach(row => console.log(`${row.price_pk}\t${row.ticker_fk}\t$${row.price_price}\t${row.tot_holdings}\t${row.price_date}`));

    });
}
*/

export default getUpdatedPrices;
