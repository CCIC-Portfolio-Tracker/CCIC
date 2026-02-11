import db from "./db.js";

// Retrieves total value for every day since january 1st of that year
async function importYTDValue() {
  try {

    const query = `
    SELECT tot_value, value_date
    FROM value_table
    WHERE value_date >= strftime('%Y-01-01', 'now')
    `;

    const result = await db.execute(query);
    const rows = result.rows;
    if (rows.length === 0) console.log("(Table is currently empty)");

    return rows.map(row => ({
      value: row.tot_value,
      date: row.value_date,
    }));

  } catch (err) {
    console.error("Error in importYTDValue:", err);
    return [];
  }

}

export default importYTDValue;