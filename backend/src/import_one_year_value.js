import db from "./db.js";

async function importOneYearValue() {
  try {

    const query = `
    SELECT tot_value, value_date
    FROM value_table
    value_date >= date('now', '-1 year')
    `;

    const result = await db.execute(query);
    const rows = result.rows;
    if (rows.length === 0) console.log("(Table is currently empty)");

    return rows.map(row => ({
      value: row.tot_value,
      date: row.value_date,
    }));

  } catch (err) {
    console.error("Error in importOneYearValue:", err);
    return [];
  }

}

export default importOneYearValue;