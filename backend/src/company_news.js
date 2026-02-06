import dotenv from 'dotenv';
dotenv.config();

async function getStockNews(ticker) {
    const apiKey = process.env.FINNHUB_KEY;
    if (!apiKey) {
        console.error("Missing Finnhub API Key");
        return [];
    }

    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 1);

    // YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];

    const params = new URLSearchParams({
        symbol: ticker.toUpperCase(),
        from: formatDate(from),
        to: formatDate(to),
        token: apiKey
    });

    const url = `https://finnhub.io/api/v1/company-news?${params}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Finnhub API Error: ${response.status}`);
        }

        const data = await response.json();

        // Ensure data is an array before mapping
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