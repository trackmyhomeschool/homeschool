const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); // Use your protect middleware!
const controller = require('../controllers/homeschoolResourceController');

// List all resources
router.get('/', protect, controller.getAll);

// Bulk create from JSON
router.post('/bulk', protect, controller.bulkCreate);

// Create single resource
router.post('/', protect, controller.create);

// Update resource
router.put('/:id', protect, controller.update);

// (Optional) Get single resource
router.get('/:id', protect, controller.getOne);

module.exports = router;
