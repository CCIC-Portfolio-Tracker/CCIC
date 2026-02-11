import db from "./db.js";

// Retrieves total value for every day over three months
async function importThreeMonthValue() {
  try {

    const query = `
    SELECT tot_value, value_date
    FROM value_table
    WHERE value_date >= date('now', '-3 month')
    `;

    const result = await db.execute(query);
    const rows = result.rows;
    if (rows.length === 0) console.log("(Table is currently empty)");

    return rows.map(row => ({
      value: row.tot_value,
      date: row.value_date,
    }));

  } catch (err) {
    console.error("Error in importThreeMonthValue:", err);
    return [];
  }

}

export default importThreeMonthValue;