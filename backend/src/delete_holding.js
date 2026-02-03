import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('./src/portfolio.db');

// Function to get all tickers from ticker_table
async function deleteHolding(ticker) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const stmt = db.prepare(`
                UPDATE holding_table
                SET tot_holdings = ?, holding_active = ?
                WHERE ticker_fk = (SELECT ticker_pk FROM ticker_table WHERE ticker_text = ?)
            `);

            console.log(ticker);
           
            stmt.run(0, 0, ticker);



            stmt.finalize(() => resolve());
        });

        db.serialize(() => {
            const stmt = db.prepare(`
                UPDATE price_table
                SET tot_holdings = ?
                WHERE ticker_fk = (SELECT ticker_pk FROM ticker_table WHERE ticker_text = ?)
            `);

            console.log(ticker);
           
            stmt.run(0, ticker);



            stmt.finalize(() => resolve());
        });
    });
}

export default deleteHolding;