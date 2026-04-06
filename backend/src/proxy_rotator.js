import HttpsProxyAgent from 'https-proxy-agent';

const proxyList = process.env.PROXY_LIST ? process.env.PROXY_LIST.split(',') : [];
let currentIndex = 0;

export function getNextProxyOptions() {
    if (proxyList.length === 0) return {}; 

    const proxyUrl = proxyList[currentIndex].trim();
    const agent = new HttpsProxyAgent(proxyUrl);

    const ipOnly = proxyUrl.includes('@') ? proxyUrl.split('@')[1] : proxyUrl;
    console.log(`[Proxy] Requesting via IP: ${ipOnly}`);

    currentIndex = (currentIndex + 1) % proxyList.length;
    
    return { fetchOptions: { agent: agent } };
}