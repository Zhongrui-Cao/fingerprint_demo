// Importing required modules
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');

// Initialize the app
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// In-memory store for fingerprint hashes
const fingerprints = {};

// Serve the fingerprinting HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));  // Assumes your HTML file is named 'index.html' and is in the same directory
});

// Endpoint to receive fingerprint data
app.post('/fingerprint', (req, res) => {
    const { username, fingerprintData } = req.body;

    // Hash the fingerprint data using SHA-256
    const hash = crypto.createHash('sha256').update(JSON.stringify(fingerprintData)).digest('hex');

    // Ensure no duplicate usernames for the same hash
    if (!fingerprints[hash]) {
        fingerprints[hash] = new Set();
    }
    fingerprints[hash].add(username);

    // Send response with unique hash
    res.json({
        uniqueId: hash,
    });
});

// Endpoint to display all unique fingerprints, their counts, and unique usernames
app.get('/fingerprints', (req, res) => {
    // Calculate the number of fingerprints that have only one unique username
    const uniqueFingerprints = Object.keys(fingerprints).filter(hash => fingerprints[hash].size === 1);

    // Count total unique usernames
    const uniqueUsernames = new Set();
    for (const usernames of Object.values(fingerprints)) {
        usernames.forEach(username => uniqueUsernames.add(username));
    }

    // Convert sets to arrays for easier display
    const fingerprintsWithArray = {};
    for (const [hash, usernames] of Object.entries(fingerprints)) {
        fingerprintsWithArray[hash] = Array.from(usernames);
    }

    res.json({
        totalUniqueFingerprints: uniqueFingerprints.length,
        totalUniqueUsernames: uniqueUsernames.size,
        fingerprints: fingerprintsWithArray
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Fingerprint server running at http://localhost:${port}`);
});
