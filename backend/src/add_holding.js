import db from "./db.js";
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

async function addHolding(ticker, amount, sector, userPK) {
    const result = await yahooFinance.quote(ticker);

    if (!result || result.regularMarketOpen === undefined) {
        throw new error ("Ticker not valid");
    }

    await db.execute({
        sql: `INSERT OR IGNORE INTO ticker_table (ticker_text, ticker_co, ticker_sector) VALUES (?, ?, ?)`,
        args: [result.symbol, result.shortName, sector]
    });

    const tickerResult = await db.execute({
        sql: `SELECT ticker_pk FROM ticker_table WHERE ticker_text = ?`,
        args: [result.symbol]
    });

    if (tickerResult.rows.length === 0) throw new Error("Ticker ID not found.");
    const tickerPK = tickerResult.rows[0].ticker_pk;

    const holdingQuery = `
                        INSERT INTO holding_table (ticker_fk, tot_holdings, portfolio_fk, holding_active, purchase_price)
                        VALUES (?, ?, 1, 1, ?)
                    `;

    await db.execute({
        sql: holdingQuery,
        args: [tickerPK, amount, result.regularMarketOpen]
    });

    await db.execute({
        sql: `INSERT INTO activity_table (user_fk, ticker_fk, log_action) VALUES (?, ?, ?)`,
        args: [userPK, tickerPK, `ADD`]
    });

    console.log(`Successfully added ${amount} shares of ${result.symbol}`);
    return { success: true, tickerPK };
}

export default addHolding;