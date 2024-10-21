const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./urls.db');

// Create the table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS urls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        originalUrl TEXT NOT NULL,
        shortUrl TEXT NOT NULL
    )`);
});

module.exports = db;
