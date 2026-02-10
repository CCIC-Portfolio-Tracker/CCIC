import getUpdatedPrices from "./update_holdings.js";
import updateTotalValue from "./update_total_value.js";

async function updatePriceAndValue() {
  try {
    const now = new Date();
    const nyTimeString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
    const nyDate = new Date(nyTimeString);
    const dayOfWeek = nyDate.getDay();

    const cutoff = new Date(nyDate);
    cutoff.setHours(9, 30, 0, 0);

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

  } catch (err) {
    console.error("Error in updatePriceAndValue:", err);
    return [];
  }
}

export default updatePriceAndValue;