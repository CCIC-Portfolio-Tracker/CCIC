import db from "./db.js";

async function editHolding(ticker, amount, sector) {

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
    
    const tickerResult = await db.execute({
        sql: `SELECT ticker_pk FROM ticker_table WHERE ticker_text = ?`,
        args: [ticker]
    });

    if (tickerResult.rows.length === 0) throw new Error("Ticker ID not found.");
    const tickerPK = tickerResult.rows[0].ticker_pk;

    await db.execute({
        sql: `UPDATE holding_table SET tot_holdings = ? WHERE ticker_fk = ?`,
        args: [amount, tickerPK]
    });

    await db.execute({
        sql: `UPDATE ticker_table SET ticker_portfolio = ? WHERE ticker_pk = ?`,
        args: [sectorID, tickerPK]
    });

    /*
    await db.execute({
        sql: `INSERT INTO activity_table (user_fk, ticker_fk, log_action) VALUES (?, ?, ?)`,
        args: [userPK, tickerPK, `EDIT`]
    });
    */

    console.log(`Successfully updated ${ticker} to ${amount} shares and sector ${sector}`);
    return { success: true, tickerPK };
}

export default editHolding;