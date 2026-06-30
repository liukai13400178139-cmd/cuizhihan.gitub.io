const express = require('express');
const router = express.Router();
const { getAllDrills, getDrillById, createDrill, updateDrill, deleteDrill, getDrillStats } = require('../controllers/drillController');
const { authenticate } = require('../config/jwt');

router.get('/', getAllDrills);
router.get('/stats', authenticate, getDrillStats);
router.get('/:id', authenticate, getDrillById);
router.post('/', authenticate, createDrill);
router.put('/:id', authenticate, updateDrill);
router.delete('/:id', authenticate, deleteDrill);

module.exports = router;
