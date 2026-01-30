import { createDatabase } from './database_creation.js';
import { createTickerDatabase } from './ticker_database_creation.js';
import { createPortfolioDatabase } from './portfolio_database_creation.js';
import { createHoldingDatabase } from './brute_holding_database_creation.js';

async function runEverything() {
    try {
        console.log("Creating Database");

        await createDatabase();

        await createTickerDatabase();

        await createPortfolioDatabase();

        await createHoldingDatabase();

    } catch (error) {
        console.error("Error creating database", error);
    }
}

runEverything();