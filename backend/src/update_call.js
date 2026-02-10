import getUpdatedPrices from "./update_holdings.js";
import updateTotalValue from "./update_total_value.js";

async function updatePriceAndValue() {
  try {
    const now = new Date();
    console.log("Now:", now);
    const nyTimeString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
    console.log("NY Time String:", nyTimeString);
    const nyDate = new Date(nyTimeString);
    console.log("NY Date:", nyDate);
    const dayOfWeek = nyDate.getDay();
    console.log("Day of Week:", dayOfWeek);

    const cutoff = new Date(nyDate);
    cutoff.setHours(9, 30, 0, 0);
    console.log("Cutoff Time:", cutoff);

    let targetDate;

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

    await getUpdatedPrices(targetDate);
    await updateTotalValue(targetDate);

    console.log("Updated price and total value");

  } catch (err) {
    console.error("Error in updatePriceAndValue:", err);
    return [];
  }
}

export default updatePriceAndValue;