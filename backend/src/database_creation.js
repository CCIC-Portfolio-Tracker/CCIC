import db from "./db.js";

export async function createDatabase() {
    await db.execute(`create table if not exists ticker_table (
        ticker_pk integer primary key autoincrement,
        ticker_text text unique not null,
        ticker_co text not null,
        ticker_sector text not null default 'Unknown'
    )`);

    await db.execute(`create table if not exists price_table (
        price_pk integer primary key autoincrement,
        ticker_fk integer not null,
        price_price real not null,
        price_date text not null,
        tot_holdings real not null
    )`);

    await db.execute(`create table if not exists portfolio_table (
        portfolio_pk integer primary key autoincrement,
        portfolio_name text unique not null
    )`);

    await db.execute(`create table if not exists holding_table (
        holding_pk integer primary key autoincrement,
        portfolio_fk integer not null,
        ticker_fk integer not null,
        tot_holdings real not null,
        holding_active boolean not null default 1,
        purchase_price real not null default 100
    )`);

    await db.execute(`create table if not exists holding_table (
        holding_pk integer primary key autoincrement,
        portfolio_fk integer not null,
        ticker_fk integer not null,
        tot_holdings real not null,
        holding_active boolean not null default 1,
        purchase_price real not null default 100
    )`);

    await db.execute(`create table if not exists value_table (
        value_pk integer primary key autoincrement,
        tot_value real not null,
        value_date text unique not null
    )`);

    console.log("Tables created successfully.");


}