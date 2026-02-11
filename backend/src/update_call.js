import db from "./db.js";
import getUpdatedPrices from "./update_holdings.js";
import updateTotalValue from "./update_total_value.js";

// updates the price and total value for the current date (or previous date if before cutoff time or weekend) in the database
async function updatePriceAndValue(forceUpdate = false, histUpdate = true) {
  try {
    const now = new Date();
    const nyTimeString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
    const nyDate = new Date(nyTimeString);
    const dayOfWeek = nyDate.getDay();

    const cutoff = new Date(nyDate);
    cutoff.setHours(9, 30, 0, 0);

    let targetDate;

    // If its sunday or saturday, get friday data. If before 9:30 on a day, get yesterdays data
    if (dayOfWeek === 0) {
      const friday = new Date(nyDate);
      friday.setDate(nyDate.getDate() - 2);
      targetDate = friday.toLocaleDateString('en-CA');
    } 
    else if (dayOfWeek === 6) {
      const friday = new Date(nyDate);
      friday.setDate(nyDate.getDate() - 1);
      targetDate = friday.toLocaleDateString('en-CA');
    } 
    else if (dayOfWeek === 1 && nyDate < cutoff) {
      const friday = new Date(nyDate);
      friday.setDate(nyDate.getDate() - 3);
      targetDate = friday.toLocaleDateString('en-CA');
    } 
    else if (nyDate >= cutoff) {
      targetDate = nyDate.toLocaleDateString('en-CA');
    } 
    else {
      const yesterday = new Date(nyDate);
      yesterday.setDate(nyDate.getDate() - 1);
      targetDate = yesterday.toLocaleDateString('en-CA');
    }

    console.log("Target Date:", targetDate);

    // Check if data for the target date already exists, unless forceUpdate is true
    if (!forceUpdate) {
        const check = await db.execute(
          "SELECT value_pk FROM value_table WHERE value_date = ? LIMIT 1", 
          [targetDate]
        );
  
        if (check.rows.length > 0) {
          console.log(`Data for ${targetDate} already exists. Skipping update.`);
          return; 
        }
      }

    await getUpdatedPrices(targetDate, histUpdate);
    await updateTotalValue(targetDate);

    console.log("Updated price and total value");

  } catch (err) {
    console.error("Error in updatePriceAndValue:", err);
    return [];
  }
}

export default updatePriceAndValue;