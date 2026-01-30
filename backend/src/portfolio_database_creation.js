import sqlite3 from 'sqlite3'
let db = new sqlite3.Database('./portfolio.db');


export async function createPortfolioDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {

            db.run(`insert or ignore into portfolio_table (portfolio_name)
        values ('Investment Club Portfolio')`, (err) => {
                if (err) {
                    console.error("Error creating tables:", err);
                    reject(err);
                } else {
                    console.log("Database tables initialized successfully.");
                    resolve();
                }
            });

        });
    });
}