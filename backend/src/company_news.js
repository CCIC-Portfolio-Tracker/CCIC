import dotenv from 'dotenv'
dotenv.config()
import db from "./db.js";

const apiKey = process.env.FINNHUB_KEY;
const toDate = new Date(); 
const fromDate = new Date();

fromDate.setDate(toDate.getDate() - 1);

const toDateStr = toDate.toISOString().split('T')[0];
const fromDateStr = fromDate.toISOString().split('T')[0];

async function importHoldings() {
    const query = `SELECT ticker_text FROM ticker_table`;
    const result = await db.execute(query);
    return result.rows.map(row => row.ticker_text);
}

async function getStockNews(ticker) {

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

        return articles;

    } catch (error) {
        console.error("Could not fetch news:", error);
    }
};

async function getAllNews() {
    const tickers = await importHoldings();
    const allNews = [];

    for (const ticker of tickers) {
        const news = await getStockNews(ticker);
        allNews.push(news);
    }

    return allNews;
}

//export default getStockNews;
export default getAllNews();