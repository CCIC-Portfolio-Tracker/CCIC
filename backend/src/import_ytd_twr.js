import db from "./db.js";

async function importYTDTWR() {
    // Fetch all daily values and all cash flows for one year
    const values = await db.execute("SELECT tot_value, value_date FROM value_table WHERE value_date >= strftime('%Y-01-01', 'now') ORDER BY value_date ASC ");
    const cashFlows = await db.execute("SELECT cash_amount, cash_date FROM cash_table WHERE cash_date >= date('now', '-1 year')");
    
    let cumulativeGrowth = 1.0;
    const graphData = [];

    for (let i = 1; i < values.rows.length; i++) {
        const startVal = values.rows[i-1].tot_value;
        const endVal = values.rows[i].tot_value;
        const date = values.rows[i].value_date;
        
        // check if cash flow occurred on this date and finds their sum
        const flow = cashFlows.rows
            .filter(f => f.cash_date === date)
            .reduce((sum, f) => sum + parseFloat(f.cash_amount), 0);
        
        const subPeriodReturn = (endVal - flow) / startVal;
        
        cumulativeGrowth *= subPeriodReturn;
        
        // Convert to percentage
        const displayPercentage = ((cumulativeGrowth - 1) * 100).toFixed(2);
        
        graphData.push({
            date: date,
            value: parseFloat(displayPercentage)
        });
    }
    return graphData;
}

export default importYTDTWR;