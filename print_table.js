const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./portfolio.db');

async function printAllTables() {
    db.serialize(() => {
        
        console.log("\n--- Ticker Table ---");
        db.all(`SELECT * FROM ticker_table`, [], (err, rows) => {
            if (err) return console.error(err.message);
            console.log("PK\tTICKER\tCOMPANY");
            rows.forEach(row => console.log(`${row.ticker_pk}\t${row.ticker_text}\t${row.ticker_co}`));
        });

        console.log("\n--- Portfolio Table ---");
        db.all(`SELECT * FROM portfolio_table`, [], (err, rows) => {
            if (err) return console.error(err.message);
            console.log("PK\tNAME");
            rows.forEach(row => console.log(`${row.portfolio_pk}\t${row.portfolio_name}`));
        });

        console.log("\n--- Holding Table ---");
        db.all(`SELECT * FROM holding_table`, [], (err, rows) => {
            if (err) return console.error(err.message);
            console.log("PK\tPORT_FK\tTICK_FK\tHOLDINGS");
            rows.forEach(row => console.log(`${row.holding_pk}\t${row.portfolio_fk}\t${row.ticker_fk}\t${row.tot_holdings}`));
        });

        console.log("\n--- Price Table ---");
        db.all(`SELECT * FROM price_table`, [], (err, rows) => {
            if (err) return console.error(err.message);
            if (rows.length === 0) console.log("(Table is currently empty)");
            console.log("PK\tTICK_FK\tPRICE\tDATE");
            rows.forEach(row => console.log(`${row.price_pk}\t${row.ticker_fk}\t$${row.price_price}\t${row.price_date}`));
            
            db.close();
        });
    });
}

printAllTables();