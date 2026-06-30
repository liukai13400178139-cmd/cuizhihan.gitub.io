const express = require('express');
const router = express.Router();
const { getAllSupplies, getSuppliesById, createSupplies, updateSupplies, deleteSupplies, getSuppliesStats } = require('../controllers/suppliesController');
const { authenticate } = require('../config/jwt');

router.get('/', authenticate, getAllSupplies);
router.get('/stats', authenticate, getSuppliesStats);
router.get('/:id', authenticate, getSuppliesById);
router.post('/', authenticate, createSupplies);
router.put('/:id', authenticate, updateSupplies);
router.delete('/:id', authenticate, deleteSupplies);

module.exports = router;