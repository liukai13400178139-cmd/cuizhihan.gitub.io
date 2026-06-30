const express = require('express');
const router = express.Router();
const { getAllLogs, getRecentLogs } = require('../controllers/activityLogController');
const { authenticate } = require('../config/jwt');

router.get('/', authenticate, getAllLogs);
router.get('/recent', authenticate, getRecentLogs);

module.exports = router;