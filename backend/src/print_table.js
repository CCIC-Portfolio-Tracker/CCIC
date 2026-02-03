import db from "./db.js";


async function printAllTables() {
    db.serialize(() => {
        
        db.all(`SELECT * FROM ticker_table`, [], (err, rows) => {
            if (err) return console.error(err.message);
            console.log("\n--- Ticker Table ---");
            console.log("PK\tTICKER\tCOMPANY\tSECTOR");
            rows.forEach(row => console.log(`${row.ticker_pk}\t${row.ticker_text}\t${row.ticker_co}\t${row.ticker_sector}`));
            //rows.forEach(row => console.log(row));

        });

        db.all(`SELECT * FROM portfolio_table`, [], (err, rows) => {
            if (err) return console.error(err.message);
            console.log("\n--- Portfolio Table ---");
            console.log("PK\tNAME");
            rows.forEach(row => console.log(`${row.portfolio_pk}\t${row.portfolio_name}`));
            //rows.forEach(row => console.log(row));

        });

        db.all(`SELECT * FROM holding_table`, [], (err, rows) => {
            if (err) return console.error(err.message);
            console.log("\n--- Holding Table ---");
            console.log("PK\tPORT_FK\tTICK_FK\tHOLDINGS\tACTIVE\tPURCHASE_PRICE");
            rows.forEach(row => console.log(`${row.holding_pk}\t${row.portfolio_fk}\t${row.ticker_fk}\t${row.tot_holdings}\t${row.holding_active}\t${row.purchase_price}`));
            //rows.forEach(row => console.log(row));
        });

        db.all(`SELECT * FROM price_table`, [], (err, rows) => {
            if (err) return console.error(err.message);
            if (rows.length === 0) console.log("(Table is currently empty)");
            console.log("\n--- Price Table ---");
            console.log("PK\tTICK_FK\tPRICE\tHOLDINGS\tDATE");
            rows.forEach(row => console.log(`${row.price_pk}\t${row.ticker_fk}\t$${row.price_price}\t${row.price_date}`));
            //rows.forEach(row => console.log(row));

            db.close();
        });
    });
}

printAllTables();