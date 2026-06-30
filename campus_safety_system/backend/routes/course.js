const express = require('express');
const router = express.Router();
const { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse, getLearningProgress, updateLearningProgress, getCourseStats } = require('../controllers/courseController');
const { authenticate } = require('../config/jwt');

router.get('/', getAllCourses);
router.get('/stats', authenticate, getCourseStats);
router.get('/progress', authenticate, getLearningProgress);
router.get('/:id', authenticate, getCourseById);
router.post('/', authenticate, createCourse);
router.post('/progress', authenticate, updateLearningProgress);
router.put('/:id', authenticate, updateCourse);
router.delete('/:id', authenticate, deleteCourse);

module.exports = router;
