const express = require('express');
const router = express.Router();
const { getAllDangers, getDangerById, createDanger, updateDanger, deleteDanger, getDangerStats, getHeatmapData } = require('../controllers/dangerController');
const { authenticate } = require('../config/jwt');

router.get('/', getAllDangers);
router.get('/stats', authenticate, getDangerStats);
router.get('/heatmap', authenticate, getHeatmapData);
router.get('/:id', authenticate, getDangerById);
router.post('/', authenticate, createDanger);
router.put('/:id', authenticate, updateDanger);
router.delete('/:id', authenticate, deleteDanger);

module.exports = router;
