import db from "./db.js";

export async function createPortfolioDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {

            db.execute(`insert or ignore into portfolio_table (portfolio_name)
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