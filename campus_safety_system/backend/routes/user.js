const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, deleteUser, getAllRoles, getUserStats } = require('../controllers/userController');
const { authenticate } = require('../config/jwt');

router.get('/', authenticate, getAllUsers);
router.get('/stats', authenticate, getUserStats);
router.get('/roles', authenticate, getAllRoles);
router.get('/:id', authenticate, getUserById);
router.post('/', authenticate, createUser);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

module.exports = router;
