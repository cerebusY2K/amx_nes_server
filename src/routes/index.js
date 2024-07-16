// src/routes/index.js
const express = require('express');
const { getForceUpdate } = require('../controllers/forceUpdateController');

const router = express.Router();

router.get('/force-update', getForceUpdate);

module.exports = router;
