import dotenv from 'dotenv'
dotenv.config()

async function getStockNews(ticker) {
    const apiKey = process.env.FINNHUB_KEY;
    const toDate = new Date();
    const fromDate = new Date();

    fromDate.setDate(toDate.getDate() - 1);

    const toDateStr = toDate.toISOString().split('T')[0];
    const fromDateStr = fromDate.toISOString().split('T')[0];

    const url = `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${fromDateStr}&to=${toDateStr}&token=${apiKey}`;

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

        console.log(articles)

        return articles;

    } catch (error) {
        console.error("Could not fetch news:", error);
    }
};

export default getStockNews;
