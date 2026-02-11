import db from "./db.js";

// creates portfolio database
export async function createPortfolioDatabase() {

    await db.execute(`insert or ignore into portfolio_table (portfolio_name)
        values ('Technology'),
        ('Healthcare'),
        ('Energy/Infrastructure'),
        ('Consumer'),
        ('Financials'),
        ('Aerospace & Defense'),
        ('Real Estate'),
        ('Emerging Markets'),
        ('ETF'),
        ('Bankruptcy'),
        ('Other')`);


    console.log("Database tables initialized successfully.");

}

