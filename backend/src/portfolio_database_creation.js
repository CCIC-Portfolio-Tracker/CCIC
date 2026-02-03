import db from "./db.js";

export async function createPortfolioDatabase() {

    await db.execute(`insert or ignore into portfolio_table (portfolio_name)
        values ('Investment Club Portfolio')`)


    console.log("Database tables initialized successfully.");

}

