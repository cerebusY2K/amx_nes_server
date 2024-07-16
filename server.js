const express = require('express');
const { db } = require('./firebaseAdmin');
const redisClient = require('./cache');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3030;

app.get('/force-update', async (req, res) => {
    try {
        const cacheKey = 'force_update_data';
        const cacheExpiry = 60 * 5; // Cache expiry in seconds (5 minutes)

        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.json(JSON.parse(cachedData));
        }

        const appsRef = db.collection('apps');
        const snapshot = await appsRef.get();
        const appsData = snapshot.docs.map(doc => doc.data());

        await redisClient.setEx(cacheKey, cacheExpiry, JSON.stringify(appsData));

        res.json(appsData);
    } catch (error) {
        console.error('Error fetching force update data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
