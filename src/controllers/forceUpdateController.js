// src/controllers/forceUpdateController.js
const { db } = require('../services/firebase');
const { getAsync, setAsync } = require('../services/redis');

const FORCE_UPDATE_KEY = 'force_update';

const getForceUpdate = async (req, res) => {
  try {
    // Try to get data from Redis
    let forceUpdateData = await getAsync(FORCE_UPDATE_KEY);
    if (forceUpdateData) {
      return res.json(JSON.parse(forceUpdateData));
    }

    // If not in Redis, fetch from Firestore
    const docRef = db.collection('apps').doc('your-app-id'); // Adjust this to your Firestore collection and document ID
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).send('No force update data found');
    }

    forceUpdateData = doc.data();

    // Store data in Redis for subsequent requests
    await setAsync(FORCE_UPDATE_KEY, JSON.stringify(forceUpdateData));

    return res.json(forceUpdateData);
  } catch (error) {
    console.error('Error fetching force update data:', error);
    return res.status(500).send('Internal Server Error');
  }
};

module.exports = { getForceUpdate };
