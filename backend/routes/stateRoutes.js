// routes/stateRoutes.js
const express = require('express');
const router = express.Router();
const State = require('../models/State');

// Get all states (only send name and _id)
router.get('/', async (req, res) => {
  try {
    const states = await State.find().select('name'); // Only send name and _id
    res.json(states);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

// Get single state by ID (send full details)
router.get('/:id', async (req, res) => {
  try {
    const state = await State.findById(req.params.id);
    if (!state) return res.status(404).json({ message: 'State not found' });
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch state' });
  }
});


// Update state by ID
router.patch('/:id', async (req, res) => {
  try {
    const state = await State.findById(req.params.id);
    if (!state) return res.status(404).json({ message: 'State not found' });
    // Only allow editing these fields
    if (req.body.creditDefinition) state.creditDefinition = req.body.creditDefinition;
    if (req.body.hoursPerCredit !== undefined) state.hoursPerCredit = req.body.hoursPerCredit;
    if (req.body.minCreditsRequired !== undefined) state.minCreditsRequired = req.body.minCreditsRequired;
    await state.save();
    res.json({ success: true, state });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update state', details: err.message });
  }
});

module.exports = router;
