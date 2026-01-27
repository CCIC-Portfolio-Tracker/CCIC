var sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./mcu.db');

// db.serialize ensures the tables are created and filled BEFORE the query runs
db.serialize(() => {
    // 1. Create the tables (IF NOT EXISTS prevents errors on re-runs)
    db.run(`create table if not exists hero (
        hero_id int primary key not null,
        hero_name text not null,
        is_xman text not null,
        was_snapped text not null
    )`);

    // 2. Use INSERT OR IGNORE so you don't get 'duplicate ID' errors
    db.run(`insert or ignore into hero (hero_id, hero_name, is_xman, was_snapped)
        values (1, 'Spiderman', 'N', 'Y'),
               (2, 'Tony Stark', 'N', 'N'),
               (3, 'Jean Grey', 'Y', 'N')`);

    db.run(`create table if not exists hero_power (
        hero_id int not null,
        hero_power text not null
    )`);

    db.run(`insert or ignore into hero_power (hero_id, hero_power)
        values (1, 'Web Slinging'),
               (1, 'Super Strength'),
               (1, 'Total Nerd'),
               (2, 'Total Nerd'),
               (3, 'Telepathic Manipulation'),
               (3, 'Astral Projection')`);

    // 3. Run the query inside the serialize block
    runQueries(db);
});

function runQueries(db) {
    // We pass the parameter in an array [ ] for safety
    db.all(`select hero_name, is_xman, was_snapped from hero h
            inner join hero_power hp on h.hero_id = hp.hero_id
            where hero_power = ?`, ["Total Nerd"], (err, rows) => {
        
        // Always check for errors to avoid the 'undefined' crash
        if (err) {
            console.error(err.message);
            return;
        }

        rows.forEach(row => {
            console.log(row.hero_name + "\t" + row.is_xman + "\t" + row.was_snapped);
        });
    });
}