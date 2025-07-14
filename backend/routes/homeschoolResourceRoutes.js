const express = require('express');
const router = express.Router();
const HomeschoolResource = require('../models/HomeschoolResource');

// Get all resources, optionally filter by state
router.get('/', async (req, res) => {
  const { state } = req.query;
  try {
    let filter = {};
    if (state) filter.state = state;
    const resources = await HomeschoolResource.find(filter);
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
