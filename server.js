const express = require('express');
const ShortId = require('shortid');
const db = require('./database'); // Import the database connection
const path = require('path');

const app = express();

// Middleware to parse JSON body and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Route for shortening the URL
app.post('/shorten', (req, res) => {
    const { originalUrl } = req.body;

    // Generate a short ID for the URL
    const shortUrl = ShortId.generate();

    // Insert the URL into the database
    const sql = `INSERT INTO urls (originalUrl, shortUrl) VALUES (?, ?)`;
    db.run(sql, [originalUrl, `http://localhost:5000/${shortUrl}`], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error saving the URL' });
        }
        // Return the shortened URL as JSON
        res.json({ originalUrl, shortUrl: `http://localhost:5000/${shortUrl}` });
    });
});

// Route for redirecting to the original URL
app.get('/:shortUrl', (req, res) => {
    const { shortUrl } = req.params;

    // Find the original URL in the database
    const sql = `SELECT originalUrl FROM urls WHERE shortUrl = ?`;
    db.get(sql, [`http://localhost:5000/${shortUrl}`], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
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
