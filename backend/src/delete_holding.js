import db from "./db.js";

async function deleteHolding(ticker) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const stmt = db.prepare(`
                UPDATE holding_table
                SET tot_holdings = ?, holding_active = ?
                WHERE ticker_fk = (SELECT ticker_pk FROM ticker_table WHERE ticker_text = ?)
            `);

            console.log(ticker);
           
            stmt.execute(0, 0, ticker);



            stmt.finalize(() => resolve());
        });
    });
}

export default deleteHolding;