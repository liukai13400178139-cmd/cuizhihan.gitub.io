const express = require('express');
const router = express.Router();
const { getAllNotices, getNoticeById, createNotice, updateNotice, deleteNotice, getNoticeStats } = require('../controllers/noticeController');
const { authenticate } = require('../config/jwt');

router.get('/', getAllNotices);
router.get('/stats', authenticate, getNoticeStats);
router.get('/:id', authenticate, getNoticeById);
router.post('/', authenticate, createNotice);
router.put('/:id', authenticate, updateNotice);
router.delete('/:id', authenticate, deleteNotice);

module.exports = router;
