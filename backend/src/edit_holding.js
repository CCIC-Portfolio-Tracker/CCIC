import db from "./db.js";

async function editHolding(ticker, amount, sector) {
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
        sql: `UPDATE ticker_table SET ticker_sector = ? WHERE ticker_pk = ?`,
        args: [sector, tickerPK]
    });

    console.log(`Successfully updated ${ticker} to ${amount} shares and sector ${sector}`);
    return { success: true, tickerPK };
}

export default editHolding;