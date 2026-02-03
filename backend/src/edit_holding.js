import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./src/portfolio.db');

async function editHolding(ticker, amount, sector) {

    return new Promise((resolve, reject) => {

        db.serialize(() => {
            db.get(
                `SELECT ticker_pk FROM ticker_table WHERE ticker_text = ?`, 
                [ticker], 
                (err, row) => {
                    if (err) return reject(err);
                    if (!row) return reject("Ticker ID not found.");

                    const tickerPK = row.ticker_pk;

                    const holdingQuery = `
                        UPDATE holding_table
                        SET tot_holdings = ?
                        WHERE ticker_fk = ${tickerPK}
                    `;

                    db.run(holdingQuery, [amount], function(err) {
                        if (err) return reject(err);
                        
                        console.log(`Successfully updated to ${amount} shares of ${ticker}`);

                        resolve({ success: true, tickerPK });
                    });

                    const sectorQuery = `
                        UPDATE ticker_table
                        SET ticker_sector = ?
                        WHERE ticker_pk = ${tickerPK}
                    `;

                    db.run(sectorQuery, [sector], function(err) {
                        if (err) return reject(err);
                        
                        console.log(`Successfully updated sector to ${sector} for ${ticker}`);

                        resolve({ success: true, tickerPK });
                    });
                }
            );
        });
    });
}

// Ensure the export matches the function name
export default editHolding;