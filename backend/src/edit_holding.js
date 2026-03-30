import db from "./db.js";
import updatePriceAndValue from "./update_call.js";
import { Decimal } from 'decimal.js';

// allows users to edit a holding
async function editHolding(ticker, amount) {

    // Gets ticker primary key and total holdings
    const tickerResult = await db.execute({
        sql: `SELECT t.ticker_pk, h.tot_holdings 
              FROM ticker_table t 
              INNER JOIN holding_table h ON t.ticker_pk = h.ticker_fk 
              WHERE ticker_text = ?`,
        args: [ticker]
    });

    if (tickerResult.rows.length === 0) throw new Error("Ticker ID not found or not held.");

    const tickerPK = tickerResult.rows[0].ticker_pk;
    const heldAmount = new Decimal(tickerResult.rows[0].tot_holdings);
    
    const removeAmount = new Decimal(amount);
    const amountDiff = heldAmount.minus(removeAmount);

    if (amountDiff.isNegative()) {
        throw new Error("Cannot remove more shares than currently held.");
    }

    if (amountDiff.isZero()) {
        await db.execute({
            sql: `DELETE FROM holding_table WHERE ticker_fk = ?`,
            args: [tickerPK]
        });
    } else {
        await db.execute({
            sql: `UPDATE holding_table SET tot_holdings = ? WHERE ticker_fk = ?`,
            args: [amountDiff.toNumber(), tickerPK]
        });
    }

    await db.execute({
        sql :`UPDATE price_table
              SET tot_holdings = ?
              WHERE ticker_fk = ?
              AND price_date = (SELECT MAX(price_date) FROM price_table WHERE ticker_fk = ?)`,
        args: [amountDiff.toNumber(), tickerPK, tickerPK]
    });

    await updatePriceAndValue(true, false);

    console.log(`Successfully updated ${ticker}. New share total: ${amountDiff.toNumber()}`);
    return { success: true, tickerPK, newTotal: amountDiff.toNumber() };
}

export default editHolding;