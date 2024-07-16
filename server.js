const express = require('express');
const path = require('path');
const { db } = require('./firebaseAdmin');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// In-memory cache
let cache = {};
const cacheExpiry = 60 * 5 * 1000; // Cache expiry in milliseconds (5 minutes)

const setCache = (key, data) => {
    cache[key] = {
        data: data,
        expiry: Date.now() + cacheExpiry
    };
};

const getCache = (key) => {
    const cached = cache[key];
    if (cached && cached.expiry > Date.now()) {
        return cached.data;
    }
    return null;
};

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('/force-update', async (req, res) => {
    try {
        const cacheKey = 'force_update_data';

        const cachedData = getCache(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        const appsRef = db.collection('apps');
        const snapshot = await appsRef.get();
        const appsData = snapshot.docs.map(doc => doc.data());

        setCache(cacheKey, appsData);

        res.json(appsData);
    } catch (error) {
        console.error('Error fetching force update data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
