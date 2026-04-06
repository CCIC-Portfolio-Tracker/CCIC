import db from "./db.js";
import updatePriceAndValue from "./update_call.js";
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
import { getNextProxyOptions } from "./proxy_rotator.js";

// Adds a new holding to the database
async function addHolding(ticker, amount, sector) {
    const proxyOptions = getNextProxyOptions();

    let result;
    let fetchSuccess = false;
    let attempts = 0;
    const maxAttempts = 6; // It will try up to 6 different proxies before giving up

    console.log(`Starting batch fetch for ${uniqueTickerTexts.length} tickers...`);

    while (!fetchSuccess && attempts < maxAttempts) {
        const proxyOptions = getNextProxyOptions();

        try {
            // Pass proxyOptions as the 3rd argument
            result = await yahooFinance.quote(ticker, {}, proxyOptions);
            fetchSuccess = true; // If we reach this line, the proxy worked!

        } catch (err) {
            console.warn(`[Attempt ${attempts + 1}] Proxy hit a 429 Ban. Rotating to next IP...`);
            attempts++;

            // Pause for 1.5 seconds before retrying so we don't spam the network
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }

    // If all attempts failed, exit safely without crashing the server
    if (!fetchSuccess) {
        console.error("All proxy attempts failed. Skipping live update to protect server.");
        return;
    }

    if (!result || result.regularMarketOpen === undefined) {
        throw new Error("Ticker not valid");
    }

    let sectorID = 0;

    // Map sector string to sector ID
    if (sector == 'Technology') {
        sectorID = 1;
    } else if (sector == 'Healthcare') {
        sectorID = 2;
    } else if (sector == 'Energy/Infrastructure') {
        sectorID = 3;
    } else if (sector == 'Consumer') {
        sectorID = 4;
    } else if (sector == 'Financials') {
        sectorID = 5;
    } else if (sector == 'Aerospace & Defense') {
        sectorID = 6;
    } else if (sector == 'Real Estate') {
        sectorID = 7;
    } else if (sector == 'Emerging Markets') {
        sectorID = 8;
    } else if (sector == 'ETF') {
        sectorID = 9;
    } else if (sector == 'Bankruptcy') {
        sectorID = 10;
    } else {
        throw new Error("Sector not valid");
    }


    // Insert ticker if it doesn't exist
    await db.execute({
        sql: `INSERT OR IGNORE INTO ticker_table (ticker_text, ticker_co, ticker_portfolio) VALUES (?, ?, ?)`,
        args: [result.symbol, result.shortName, sectorID]
    });

    // get ticker PK for holding insertion
    const tickerResult = await db.execute({
        sql: `SELECT ticker_pk FROM ticker_table WHERE ticker_text = ?`,
        args: [result.symbol]
    });

    // Safety check to ensure ticker was inserted or already exists
    if (tickerResult.rows.length === 0) throw new Error("Ticker ID not found.");
    const tickerPK = tickerResult.rows[0].ticker_pk;

    // Insert holding
    try {
        const holdingQuery = `
                        INSERT INTO holding_table (ticker_fk, tot_holdings, portfolio_fk, holding_active, purchase_price)
                        VALUES (?, ?, ?, 1, ?)
                    `;

        await db.execute({
            sql: holdingQuery,
            args: [tickerPK, amount, sectorID, result.regularMarketOpen]
        });

    } catch (error) {
        if (error.message.includes("UNIQUE constraint failed")) {
            throw new Error(`Database rejected duplicate ${result.symbol}. Your schema might prevent separate lots.`);
        }
        throw error;
    }

    /*
    await db.execute({
        sql: `INSERT INTO activity_table (user_fk, ticker_fk, log_action) VALUES (?, ?, ?)`,
        args: [userPK, tickerPK, `ADD`]
    });
    */

    await updatePriceAndValue(true, false);

    console.log(`Successfully added ${amount} shares of ${result.symbol}`);
    return { success: true, tickerPK };
}

export default addHolding;