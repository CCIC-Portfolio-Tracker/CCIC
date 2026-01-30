// runner.js
import { createDatabase } from './database_creation.js';
import { createTickerDatabase } from './ticker_database_creation.js';
import { createPortfolioDatabase } from './portfolio_database_creation.js';
import { createHoldingDatabase } from './brute_holding_database_creation.js';




async function runEverything() {
    try {
        console.log("--- Starting Daily Task Pipeline ---");

        console.log("1. Updating Holdings...");
        await createDatabase();

        console.log("2. Backing up Database...");
        await createTickerDatabase();

        console.log("3. Generating Reports...");
        await createPortfolioDatabase();

        await createHoldingDatabase();

        console.log("--- All Tasks Completed Successfully ---");
    } catch (error) {
        console.error("Pipeline failed at some step:", error);
    }
}

runEverything();