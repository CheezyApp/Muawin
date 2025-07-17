const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// Get all locations
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching locations', error: error.message });
  }
});

// Add a new location
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Location name is required.' });
  }

  try {
    const newLocation = new Location({ name });
    await newLocation.save();
    res.status(201).json(newLocation);
  } catch (error) {
    // console.error('Error adding location:', error);


    res.status(500).json({ error: 'Failed to add location.' });
  }
});

// Update a location
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Location name is required.' });

  try {
    const updated = await Location.findByIdAndUpdate(id, { name }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Location not found.' });
    res.json(updated);
  } catch (error) {
    // console.error('Error updating location:', error);


    res.status(500).json({ error: 'Failed to update location.' });
  }
});

// Delete a location
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Location.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Location not found.' });
    res.json({ message: 'Location deleted successfully.' });
  } catch (error) {
    // console.error('Error deleting location:', error);


    res.status(500).json({ error: 'Failed to delete location.' });
  }
});

module.exports = router; 