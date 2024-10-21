const express = require('express');
const ShortId = require('shortid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

// Middleware to parse JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form data
app.use(express.static(path.join(__dirname, 'public'))); // serve static files

// Create or open the database
const db = new sqlite3.Database('./urls.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create a table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    originalUrl TEXT NOT NULL,
    shortUrl TEXT NOT NULL
)`);

// Route for shortening the URL
app.post('/shorten', (req, res) => {
    const { originalUrl } = req.body;

    // Generate a short ID for the URL
    const shortUrl = ShortId.generate();

    // Insert the URL into the database
    const sql = `INSERT INTO urls (originalUrl, shortUrl) VALUES (?, ?)`;
    db.run(sql, [originalUrl, `http://localhost:5000/${shortUrl}`], function(err) {
        if (err) {
            return console.log(err.message);
        }
        res.render('index', {
            originalUrl,
            shortUrl: `http://localhost:5000/${shortUrl}`
        });
    });
});

// Route for redirecting to the original URL
app.get('/:shortUrl', (req, res) => {
    const { shortUrl } = req.params;

    // Find the original URL in the database
    const sql = `SELECT originalUrl FROM urls WHERE shortUrl = ?`;
    db.get(sql, [`http://localhost:5000/${shortUrl}`], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        if (row) {
            return res.redirect(row.originalUrl);
        } else {
            return res.status(404).send('URL not found');
        }
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
