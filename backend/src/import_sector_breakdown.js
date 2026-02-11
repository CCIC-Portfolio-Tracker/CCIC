import getSectorBreakdown from "./sector_breakdown";

async function importSectorBreakdown() {
    const now = new Date()
    
    const currentDate = now.toLocaleDateString('en-CA', {
        timeZone: 'America/New_York' 
    });

    now.setFullYear(now.getFullYear() - 1);

    const pastDate = now.toLocaleDateString('en-CA', {
        timeZone: 'America/New_York' 
    });

    const [currentData, historicalData] = await Promise.all([
        getSectorBreakdown(currentDate),
        getSectorBreakdown(pastDate)
    ]);

    return {
        current: currentData,
        historical: historicalData,
    };
}

export default importSectorBreakdown;