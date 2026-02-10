import db from "./db.js";
import { Decimal } from 'decimal.js';

async function deleteHolding(ticker) {
    const query = `
                UPDATE holding_table
                SET tot_holdings = ?, holding_active = ?
                WHERE ticker_fk = (SELECT ticker_pk FROM ticker_table WHERE ticker_text = ?)
            `;

    console.log(`Deleting ticker: ${ticker}`);

    await db.execute({
        sql: query,
        args: [0, 0, ticker]
    });

    const tickerPK = await db.execute({
        sql: `SELECT ticker_pk FROM ticker_table WHERE ticker_text = ?`,
        args: [ticker]
    });

    /*
    await db.execute({
        sql: `INSERT INTO activity_table (user_fk, ticker_fk, log_action) VALUES (?, ?, ?)`,
        args: [userPK, tickerPK, `DELETE`]
    });
    */

    const timestamp = currentDate.toLocaleDateString('en-CA', {
        timeZone: 'America/New_York' 
    });


    const sellQuery = `
                SELECT tot_holdings, price_price FROM price_table WHERE price_date = ? AND ticker_fk = (SELECT ticker_pk FROM ticker_table WHERE ticker_text = ?)
            `;

    const result = await db.execute({
        sql: sellQuery,
        args: [timestamp, ticker]
    });

    let cashAmt;

    result.rows.forEach(row => {
        const price = new Decimal(row.price_price);
        const holdings = new Decimal(row.tot_holdings);

        cashAmt = cashAmt.plus(price.times(holdings));
    });


    const cashQuery = `
                INSERT INTO cash_table (cash_amount, cash_date) VALUES (?, ?)
            `;

    

    await db.execute({
        sql: cashQuery,
        args: [0, cashAmt, ticker]
    });

    const priceQuery = `
                UPDATE price_table
                SET tot_holdings = ?
                WHERE ticker_fk = (SELECT ticker_pk FROM ticker_table WHERE ticker_text = ?)
                AND price_date = (SELECT MAX(price_date) FROM price_table WHERE ticker_fk = (SELECT ticker_pk FROM ticker_table WHERE ticker_text = ?))
            `;

    await db.execute({
        sql: priceQuery,
        args: [0, ticker, ticker]
    });

}

export default deleteHolding;