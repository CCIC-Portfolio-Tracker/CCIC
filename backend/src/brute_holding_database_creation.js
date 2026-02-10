import db from "./db.js";

export async function createHoldingDatabase() {
    try {
        const fixedDate = '2025-02-09';

        await db.execute(`insert or ignore into holding_table 
            (portfolio_fk, ticker_fk, tot_holdings, purchase_price, purchase_date)
        values 
            (1, 1, 100.87, 47.74, '${fixedDate}'),    -- INTC
            (1, 2, 8.00, 255.60, '${fixedDate}'),     -- ISRG
            (1, 3, 74.18, 72.54, '${fixedDate}'),     -- MDT
            (1, 4, 6.10, 266.23, '${fixedDate}'),     -- SYK
            (1, 5, 27.44, 639.59, '${fixedDate}'),    -- VOO
            (1, 6, 7.00, 79.99, '${fixedDate}'),      -- AMD
            (1, 7, 3.16, 181.29, '${fixedDate}'),     -- BABA
            (1, 8, 3.00, 163.63, '${fixedDate}'),     -- ALGN
            (1, 9, 1.00, 189.63, '${fixedDate}'),     -- GOOG
            (1, 10, 23.60, 112.44, '${fixedDate}'),   -- AAPL
            (1, 11, 8.09, 200.77, '${fixedDate}'),    -- AMAT
            (1, 12, 1.01, 233.15, '${fixedDate}'),    -- AVGO
            (1, 13, 5.70, 34.53, '${fixedDate}'),     -- BEP
            (1, 14, 9.99, 54.75, '${fixedDate}'),     -- CSCO
            (1, 15, 7.00, 170.00, '${fixedDate}'),    -- CRWD
            (1, 16, 6.53, 139.00, '${fixedDate}'),    -- LLY
            (1, 17, 10.00, 98.79, '${fixedDate}'),    -- FTNT
            (1, 18, 1.79, 61.29, '${fixedDate}'),     -- KTB
            (1, 19, 10.00, 42.52, '${fixedDate}'),    -- ODD
            (1, 20, 2.00, 207.71, '${fixedDate}'),    -- PYPL
            (1, 21, 5.00, 69.00, '${fixedDate}'),     -- RDDT
            (1, 22, 4.00, 11.83, '${fixedDate}'),     -- RUN
            (1, 23, 5.98, 225.01, '${fixedDate}'),    -- TXN
            (1, 24, 12.37, 20.51, '${fixedDate}'),    -- VFC
            (1, 25, 20.00, 5.77, '${fixedDate}'),     -- VWDRY
            (1, 26, 3.07, 223.15, '${fixedDate}'),    -- WM
            (1, 27, 9.43, 112.41, '${fixedDate}'),    -- ABBV
            (1, 28, 10.00, 50.80, '${fixedDate}'),    -- AGYS
            (1, 29, 3.05, 144.63, '${fixedDate}'),    -- AXP
            (1, 30, 16.00, 34.78, '${fixedDate}'),    -- ANET
            (1, 31, 6.34, 68.04, '${fixedDate}'),     -- AZN
            (1, 32, 5.42, 17.25, '${fixedDate}'),     -- T
            (1, 33, 46.06, 54.01, '${fixedDate}'),    -- BAC
            (1, 34, 2.00, 191.75, '${fixedDate}'),    -- BA
            (1, 35, 12.02, 50.43, '${fixedDate}'),    -- KO
            (1, 36, 3.00, 47.18, '${fixedDate}'),     -- CPRT
            (1, 37, 4.05, 163.97, '${fixedDate}'),    -- DHI
            (1, 38, 140.00, 3.63, '${fixedDate}'),    -- UUUU
            (1, 39, 31.59, 78.68, '${fixedDate}'),    -- XOM
            (1, 40, 2.00, 130.71, '${fixedDate}'),    -- FISV
            (1, 41, 1.03, 282.77, '${fixedDate}'),    -- GD
            (1, 42, 5.19, 80.84, '${fixedDate}'),     -- IRM
            (1, 43, 12.96, 16.62, '${fixedDate}'),    -- KMI
            (1, 44, 10.84, 94.53, '${fixedDate}'),    -- MRK
            (1, 45, 15.35, 283.82, '${fixedDate}'),   -- MSFT
            (1, 46, 2.05, 480.19, '${fixedDate}'),    -- NGD
            (1, 47, 92.15, 65.60, '${fixedDate}'),    -- NVDA
            (1, 48, 53.76, 59.91, '${fixedDate}'),    -- SSO
            (1, 49, 3.08, 98.46, '${fixedDate}'),     -- RTX
            (1, 50, 9.08, 157.07, '${fixedDate}'),    -- CRM
            (1, 51, 5.31, 55.37, '${fixedDate}'),     -- SLG
            (1, 52, 5.94, 103.95, '${fixedDate}'),    -- SDY
            (1, 53, 6.85, 153.89, '${fixedDate}'),    -- VDC
            (1, 54, 12.20, 74.88, '${fixedDate}'),    -- VNQ
            (1, 55, 10.24, 38.72, '${fixedDate}'),    -- VWO
            (1, 56, 35.59, 49.50, '${fixedDate}'),    -- WFC
            (1, 57, 18.99, 46.91, '${fixedDate}'),    -- C
            (1, 58, 150.00, 13.64, '${fixedDate}'),   -- GLNCY
            (1, 59, 1.33, 20.09, '${fixedDate}'),     -- GRAL
            (1, 60, 4.00, 323.32, '${fixedDate}'),    -- ICLR
            (1, 61, 8.00, 129.75, '${fixedDate}'),    -- ILMN
            (1, 62, 6.10, 54.84, '${fixedDate}'),     -- MU
            (1, 63, 10.21, 119.07, '${fixedDate}'),   -- NVO
            (1, 64, 6.27, 55.76, '${fixedDate}'),     -- SLB
            (1, 65, 17.21, 57.04, '${fixedDate}'),    -- TSM
            (1, 66, 4.00, 209.28, '${fixedDate}'),    -- TSLA
            (1, 67, 100.00, 5.59, '${fixedDate}'),    -- TTI
            (1, 68, 8.00, 53.38, '${fixedDate}'),     -- VEON
            (1, 69, 12.25, 54.21, '${fixedDate}'),    -- WMT
            (1, 70, 2.10, 445.78, '${fixedDate}'),    -- LMT
            (1, 71, 541.33, 14.62, '${fixedDate}'),   -- AES
            (1, 72, 7.00, 185.51, '${fixedDate}'),    -- CLH
            (1, 73, 250.00, 0.70, '${fixedDate}'),    -- EOSE
            (1, 74, 50.00, 172.21, '${fixedDate}'),   -- FSLR
            (1, 75, 600.00, 21.27, '${fixedDate}'),   -- GRRR
            (1, 76, 62.00, 2.01, '${fixedDate}'),     -- KULR
            (1, 77, 2000.00, 2.42, '${fixedDate}'),   -- LAC
            (1, 78, 40.00, 34.76, '${fixedDate}'),    -- NXT
            (1, 79, 15.00, 96.05, '${fixedDate}'),    -- PSN
            (1, 80, 3.27, 91.35, '${fixedDate}')      -- XYL`
        );
        console.log(`Database initialized: 80 holdings inserted with purchase date ${fixedDate}.`);
    } catch (err) {
        console.error("Error in createHoldingDatabase:", err);
    }
}