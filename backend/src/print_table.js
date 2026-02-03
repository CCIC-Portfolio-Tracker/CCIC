import sqlite3 from 'sqlite3'
const db = new sqlite3.Database('./portfolio.db');

async function printAllTables() {
    db.serialize(() => {
        
        db.all(`SELECT * FROM ticker_table`, [], (err, rows) => {
            if (err) return console.error(err.message);
            console.log("\n--- Ticker Table ---");
            console.log("PK\tTICKER\tCOMPANY");
            rows.forEach(row => console.log(`${row.ticker_pk}\t${row.ticker_text}\t${row.ticker_co}`));
        });

        db.all(`SELECT * FROM portfolio_table`, [], (err, rows) => {
            if (err) return console.error(err.message);
            console.log("\n--- Portfolio Table ---");
            console.log("PK\tNAME");
            rows.forEach(row => console.log(`${row.portfolio_pk}\t${row.portfolio_name}`));
        });

        db.all(`SELECT * FROM holding_table`, [], (err, rows) => {
            if (err) return console.error(err.message);
            console.log("\n--- Holding Table ---");
            console.log("PK\tPORT_FK\tTICK_FK\tHOLDINGS");
            //rows.forEach(row => console.log(`${row.holding_pk}\t${row.portfolio_fk}\t${row.ticker_fk}\t${row.tot_holdings}`));
            rows.forEach(row => console.log(row));
        });

        db.all(`SELECT * FROM price_table`, [], (err, rows) => {
            if (err) return console.error(err.message);
            if (rows.length === 0) console.log("(Table is currently empty)");
            console.log("\n--- Price Table ---");
            console.log("PK\tTICK_FK\tPRICE\tHOLDINGS\tDATE");
            rows.forEach(row => console.log(`${row.price_pk}\t${row.ticker_fk}\t$${row.price_price}\t${row.tot_holdings}\t${row.price_date}`));
            
            db.close();
        });
    });
}

printAllTables();