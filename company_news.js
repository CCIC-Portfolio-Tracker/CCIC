require('dotenv').config();

const getStockNews = async (ticker, fromDate, toDate) => {
    const apiKey = process.env.FINNHUB_KEY;
    const url = `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${fromDate}&to=${toDate}&token=${apiKey}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        console.log(data);
        
    } catch (error) {
        console.error("Could not fetch news:", error);
    }
};

getStockNews('AAPL', '2025-01-28', '2026-01-28');