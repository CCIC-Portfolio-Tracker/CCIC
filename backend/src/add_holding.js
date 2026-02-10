import db from "./db.js";
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

async function addHolding(ticker, amount, sector) {
    const result = await yahooFinance.quote(ticker);

    if (!result || result.regularMarketOpen === undefined) {
        throw new error ("Ticker not valid");
    }

    let sectorID = 0;

    if(sector == 'Technology') {
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
        throw new error ("Sector not valid");
    }


    await db.execute({
        sql: `INSERT OR IGNORE INTO ticker_table (ticker_text, ticker_co, ticker_portfolio) VALUES (?, ?, ?)`,
        args: [result.symbol, result.shortName, sectorID]
    });

    const tickerResult = await db.execute({
        sql: `SELECT ticker_pk FROM ticker_table WHERE ticker_text = ?`,
        args: [result.symbol]
    });

    if (tickerResult.rows.length === 0) throw new Error("Ticker ID not found.");
    const tickerPK = tickerResult.rows[0].ticker_pk;

    const holdingQuery = `
                        INSERT INTO holding_table (ticker_fk, tot_holdings, portfolio_fk, holding_active, purchase_price)
                        VALUES (?, ?, ?, 1, ?)
                    `;

    await db.execute({
        sql: holdingQuery,
        args: [tickerPK, amount, sectorID, result.regularMarketOpen]
    });

    /*
    await db.execute({
        sql: `INSERT INTO activity_table (user_fk, ticker_fk, log_action) VALUES (?, ?, ?)`,
        args: [userPK, tickerPK, `ADD`]
    });
    */

    console.log(`Successfully added ${amount} shares of ${result.symbol}`);
    return { success: true, tickerPK };
}

export default addHolding;