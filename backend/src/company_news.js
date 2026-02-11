import dotenv from 'dotenv';
dotenv.config();

// Fetches recent news articles for a given stock ticker using the Finnhub API
async function getStockNews(ticker) {
    const apiKey = process.env.FINNHUB_KEY;
    if (!apiKey) {
        console.error("Missing Finnhub API Key");
        return [];
    }

    // Get news from the past day
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 1);

    const formatDate = (date) => date.toISOString().split('T')[0];

    // Defines params for api pull
    const params = new URLSearchParams({
        symbol: ticker.toUpperCase(),
        from: formatDate(from),
        to: formatDate(to),
        token: apiKey
    });

    const url = `https://finnhub.io/api/v1/company-news?${params}`;

    // Make the API call and handle errors
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Finnhub API Error: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) return [];

        return data.map(article => ({
            headline: article.headline,
            company: article.related,
            date: new Date(article.datetime * 1000).toLocaleDateString(),
            summary: article.summary,
            link: article.url,
            image: article.image 
        }));

    } catch (error) {
        console.error(`Could not fetch news for ${ticker}:`, error.message);
        return []; 
    }
};

export default getStockNews;