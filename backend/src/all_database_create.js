import { createDatabase } from './database_creation.js';
import { createTickerDatabase } from './ticker_database_creation.js';
import { createPortfolioDatabase } from './portfolio_database_creation.js';
import { createHoldingDatabase } from './brute_holding_database_creation.js';
import load2025Price from './brute_price_table.js';
import load2025Value from './brute_total_value.js';

async function runEverything() {
    try {
        console.log("Creating Database");

        await createDatabase();

        await createTickerDatabase();

        await createPortfolioDatabase();

        await createHoldingDatabase();

        await load2025Price();

        await load2025Value();



    } catch (error) {
        console.error("Error creating database", error);
    }
}

await runEverything();