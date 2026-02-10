import { createDatabase } from './database_creation.js';
import { createTickerDatabase } from './ticker_database_creation.js';
import { createPortfolioDatabase } from './portfolio_database_creation.js';
import { createHoldingDatabase } from './brute_holding_database_creation.js';
import loadHistoricalPrices from './brute_price_table.js';
import getUpdatedPrices from './update_holdings.js';
import updateTotalValue from './update_total_value.js';
import loadHistoricalValue from './brute_total_value.js';

async function runEverything() {
    try {
        console.log("Creating Database");

        await createDatabase();

        await createTickerDatabase();

        await createPortfolioDatabase();

        await createHoldingDatabase();

        await loadHistoricalPrices();

        await loadHistoricalValue();



    } catch (error) {
        console.error("Error creating database", error);
    }
}

await runEverything();