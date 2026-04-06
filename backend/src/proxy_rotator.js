import yahooFinance from 'yahoo-finance2';
import { HttpsProxyAgent } from 'https-proxy-agent';

const proxyList = process.env.PROXY_LIST ? process.env.PROXY_LIST.split(',') : [];
let currentIndex = 0;

export function rotateProxy() {
    if (proxyList.length === 0) {
        return; 
    }

    const proxyUrl = proxyList[currentIndex].trim();
    const agent = new HttpsProxyAgent(proxyUrl);

    yahooFinance.setGlobalConfig({
        fetchOptions: {
            agent: agent
        }
    });

    const ipOnly = proxyUrl.includes('@') ? proxyUrl.split('@')[1] : proxyUrl;
    console.log(`[Proxy] Shifted to: ${ipOnly}`);

    currentIndex = (currentIndex + 1) % proxyList.length;
}