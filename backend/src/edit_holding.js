import db from "./db.js";
import updatePriceAndValue from "./update_call.js";
import { Decimal } from 'decimal.js';

async function editHolding(ticker, amount) {

    const tickerResult = await db.execute({
        sql: `SELECT t.ticker_pk, h.tot_holdings FROM ticker_table t INNER JOIN holding_table h ON t.ticker_pk = h.ticker_fk WHERE ticker_text = ? `,
        args: [ticker]
    });

    if (tickerResult.rows.length === 0) throw new Error("Ticker ID not found.");
    const tickerPK = tickerResult.rows[0].ticker_pk;
    const heldAmount = new Decimal(tickerResult.rows[0].tot_holdings);
    const removeAmount = new Decimal(amount);
    const amountDiff = heldAmount.minus(removeAmount);

    await db.execute({
        sql: `UPDATE holding_table SET tot_holdings = ? WHERE ticker_fk = ?`,
        args: [amountDiff, tickerPK]
    });

    await db.execute({
        sql :`UPDATE price_table
                SET tot_holdings = ?
                WHERE ticker_fk = (SELECT ticker_pk FROM ticker_table WHERE ticker_text = ?)
                AND price_date = (SELECT MAX(price_date) FROM price_table WHERE ticker_fk = (SELECT ticker_pk FROM ticker_table WHERE ticker_text = ?))`,
        args: [amount, ticker, ticker]

    })

    /*
    await db.execute({
        sql: `INSERT INTO activity_table (user_fk, ticker_fk, log_action) VALUES (?, ?, ?)`,
        args: [userPK, tickerPK, `EDIT`]
    });
    */

    await updatePriceAndValue(true, false);

    console.log(`Successfully updated ${ticker} to ${amount} shares and sector ${sector}`);
    return { success: true, tickerPK };
}

export default editHolding;