const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Designation = require('../models/Designation');

// GET /branches - fetch all branches from all zones
router.get('/branches', async (req, res) => {
  try {
    const Zone = mongoose.connection.collection('zones');
    const zones = await Zone.find({}).toArray();
    // Flatten all branches from all zones, only those with visible !== false
    const allBranches = zones.flatMap(zone =>
      (zone.branches || []).filter(branch => branch.visible !== false)
    );
    res.json(allBranches);
  } catch (err) {
    // console.error('Error fetching branches:', err);


    res.status(500).json({ error: 'Failed to fetch branches.' });
  }
});

// GET /designations - fetch all designations (fixed)
router.get('/designations', async (req, res) => {
  try {
    const designations = await Designation.find().sort({ name: 1 });
    res.json(designations);
  } catch (err) {
    // console.error('Error fetching designations:', err);


    res.status(500).json({ error: 'Failed to fetch designations.' });
  }
});

module.exports = router; 