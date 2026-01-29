import sqlite3 from 'sqlite3'
let db = new sqlite3.Database('./portfolio.db');

db.serialize(() => {

    db.run(`insert or ignore into portfolio_table (portfolio_name)
        values ('Investment Club Portfolio')`);

});