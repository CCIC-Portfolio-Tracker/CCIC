import db from "./db.js";

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
}

export default deleteHolding;