var sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./portfolio.db');

async function importHoldings() {

    const query = `
    SELECT t.ticker_text, t.ticker_co, p.price_price, p.tot_holdings
    FROM price_table p
    INNER JOIN ticker_table t ON p.ticker_fk = t.ticker_pk
    `;


    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            if (err) return console.error(err.message);
            if (rows.length === 0) console.log("(Table is currently empty)");
            //console.log("PK\tTICK_FK\tPRICE\tHOLDINGS\tDATE");
            //rows.forEach(row => console.log(`${row.price_pk}\t${row.ticker_fk}\t$${row.price_price}\t${row.tot_holdings}\t${row.price_date}`));
            
            resolve(rows);
            db.close();
        });
    });
}

async function main() {
    console.log("Loading holdings...");

    const tableData = await importHoldings();
    console.log(tableData);
    console.log("Done!");
}

main();