import db from "./db.js";
import { Decimal } from 'decimal.js';

// Finds the next available date in the value_table and returns both the date and the total value
async function getValidDateAndValue(timestamp) {
    const result = await db.execute({
        sql: `SELECT value_date, tot_value 
              FROM value_table 
              WHERE value_date >= ? 
              ORDER BY value_date ASC 
              LIMIT 1`,
        args: [timestamp]
    });

    if (result.rows.length === 0) return null;

    return {
        validDate: result.rows[0].value_date,
        totalValue: new Decimal(result.rows[0].tot_value)
    };
}

// get sector breakdown for a specific date, returns percentage of total value for each sector
async function getSectorBreakdown(timestamp) {
    const dateAndValue = await getValidDateAndValue(timestamp);
    
    if (!dateAndValue || dateAndValue.totalValue.equals(0)) {
        return { error: "Total portfolio value is 0 or no data found" };
    }

    const { validDate, totalValue } = dateAndValue;

    const query = `
        SELECT h.portfolio_fk, SUM(p.price_price * p.tot_holdings) as sector_total
        FROM price_table p
        INNER JOIN holding_table h ON p.ticker_fk = h.ticker_fk
        WHERE p.price_date = ? AND h.holding_active = 1
        GROUP BY h.portfolio_fk
    `;

    const result = await db.execute({
        sql: query,
        args: [validDate] 
    });

    const sectors = {
        1: new Decimal(0), // Tech
        2: new Decimal(0), // Health
        3: new Decimal(0), // Energy
        4: new Decimal(0), // Consumer
        5: new Decimal(0), // Financial
        6: new Decimal(0), // Aero
        7: new Decimal(0), // Real Estate
        8: new Decimal(0), // Emerging
        9: new Decimal(0), // ETF
        10: new Decimal(0), // Bank
        11: new Decimal(0)  // Other
    };

    result.rows.forEach(row => {
        if (sectors[row.portfolio_fk] !== undefined) {
            sectors[row.portfolio_fk] = new Decimal(row.sector_total);
        }
    });

    const getPercent = (sectorId) => {
        return sectors[sectorId].dividedBy(totalValue).times(100).toFixed(2);
    };

    return {
        techPercent: getPercent(1),
        healthPercent: getPercent(2),
        energyPercent: getPercent(3),
        consumerPercent: getPercent(4),
        financialPercent: getPercent(5),
        aeroPercent: getPercent(6),
        realPercent: getPercent(7),
        emergPercent: getPercent(8),
        etfPercent: getPercent(9),
        bankPercent: getPercent(10),
        otherPercent: getPercent(11)
    };
}

export default getSectorBreakdown;