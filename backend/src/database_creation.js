import sqlite3 from 'sqlite3'
let db = new sqlite3.Database('./portfolio.db');

export async function createDatabase() {
    return new Promise((resolve, reject) => {


        db.serialize(() => {
            db.run(`create table if not exists ticker_table (
        ticker_pk integer primary key autoincrement,
        ticker_text text not null,
        ticker_co text not null
    )`);

            db.run(`create table if not exists price_table (
        price_pk integer primary key autoincrement,
        ticker_fk integer not null,
        price_price real not null,
        price_date text not null,
        tot_holdings real not null
    )`);

            db.run(`create table if not exists portfolio_table (
        portfolio_pk integer primary key autoincrement,
        portfolio_name text not null
    )`);

            db.run(`create table if not exists holding_table (
        holding_pk integer primary key autoincrement,
        portfolio_fk integer not null,
        ticker_fk integer not null,
        tot_holdings real not null
    )`, (err) => {
        if (err) {
            console.error("Error creating tables:", err);
            reject(err);
        } else {
            console.log("Database tables initialized successfully.");
            resolve();
        }
    });
    




        });
    });

}