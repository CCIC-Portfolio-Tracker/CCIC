import dotenv from 'dotenv'
dotenv.config()

async function getStockNews(ticker, fromDate, toDate) {
    const apiKey = process.env.FINNHUB_KEY;
    const url = `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${fromDate}&to=${toDate}&token=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const articles = data.map(article => ({
            headline: article.headline,
            company: article.related,
            date: new Date(article.datetime * 1000).toLocaleDateString(), 
            summary: article.summary,
            link: article.url
        }));
        
        return articles;
                 
    } catch (error) {
        console.error("Could not fetch news:", error);
    }
};

const companyNews = await getStockNews('AAPL', '2025-01-28', '2026-01-28');

export default companyNews