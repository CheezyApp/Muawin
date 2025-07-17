const express = require('express');
const router = express.Router();
const CylinderExpiry = require('../models/CylinderExpiry');

// Get all cylinder expiry records for a specific zone and branch
router.get('/:zone/:branch', async (req, res) => {
  try {
    const { zone, branch } = req.params;
    const records = await CylinderExpiry.find({ zone, branch });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cylinder expiry records', error: error.message });
  }
});

// Add a new cylinder expiry record
router.post('/', async (req, res) => {
  try {
    const { location, categories, zone, branch } = req.body;

    // Validate required fields
    if (!location || !categories || !zone || !branch) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate categories array
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ message: 'Categories must be a non-empty array' });
    }

    // Validate each category
    for (const category of categories) {
      if (!category.category || !category.weight || !category.date) {
        return res.status(400).json({ 
          message: 'Each category must have category name, weight, and date' 
        });
      }
    }

    const newRecord = new CylinderExpiry({
      location,
      categories,
      zone,
      branch
    });

    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    // console.error('Error adding cylinder expiry record:', error);


    res.status(500).json({ 
      message: 'Error adding cylinder expiry record', 
      error: error.message 
    });
  }
});

// Update a cylinder expiry record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { location, categories } = req.body;

    if (!location || !categories) {
      return res.status(400).json({ message: 'Location and categories are required' });
    }

    // Validate categories array
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ message: 'Categories must be a non-empty array' });
    }

    // Validate each category
    for (const category of categories) {
      if (!category.category || !category.weight || !category.date) {
        return res.status(400).json({ 
          message: 'Each category must have category name, weight, and date' 
        });
      }
    }

    const updated = await CylinderExpiry.findByIdAndUpdate(
      id,
      { location, categories },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Cylinder expiry record not found' });
    }

    res.json(updated);
  } catch (error) {
    // console.error('Error updating cylinder expiry record:', error);


    res.status(500).json({ 
      message: 'Error updating cylinder expiry record', 
      error: error.message 
    });
  }
});

// Delete a cylinder expiry record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CylinderExpiry.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Cylinder expiry record not found' });
    }

    res.json({ message: 'Cylinder expiry record deleted successfully' });
  } catch (error) {
    // console.error('Error deleting cylinder expiry record:', error);


    res.status(500).json({ 
      message: 'Error deleting cylinder expiry record', 
      error: error.message 
    });
  }
});

module.exports = router; 