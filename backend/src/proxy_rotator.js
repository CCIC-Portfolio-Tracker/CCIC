import YahooFinance from 'yahoo-finance2';
import HttpsProxyAgent from 'https-proxy-agent';

const proxyList = process.env.PROXY_LIST ? process.env.PROXY_LIST.split(',') : [];

const configuredInstances = proxyList.length > 0 ? proxyList.map(proxyUrl => {
    const agent = new HttpsProxyAgent(proxyUrl.trim());
    return new YahooFinance({
        fetchOptions: { agent: agent },
        suppressNotices: ['yahooSurvey']
    });
}) : [new YahooFinance({ suppressNotices: ['yahooSurvey'] })]; // Fallback if no proxies exist

let currentIndex = 0;

export function getRotatedYahoo() {
    const yf = configuredInstances[currentIndex];

    if (proxyList.length > 0) {
        const proxyUrl = proxyList[currentIndex].trim();
        const ipOnly = proxyUrl.includes('@') ? proxyUrl.split('@')[1] : proxyUrl;
        console.log(`[Proxy] Using IP: ${ipOnly}`);
    }

    currentIndex = (currentIndex + 1) % configuredInstances.length;
    
    return yf;
}