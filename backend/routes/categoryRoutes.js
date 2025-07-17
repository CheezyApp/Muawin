const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// Add a new category
router.post('/', async (req, res) => {
  const { name, weight } = req.body;
  if (!name || !weight) {
    return res.status(400).json({ error: 'Category name and weight are required.' });
  }

  try {
    const newCategory = new Category({ name, weight });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    // console.error('Error adding category:', error);


    res.status(500).json({ error: 'Failed to add category.' });
  }
});

// Update a category
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, weight } = req.body;
  if (!name || !weight) return res.status(400).json({ error: 'Name and weight are required.' });

  try {
    const updated = await Category.findByIdAndUpdate(id, { name, weight }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Category not found.' });
    res.json(updated);
  } catch (error) {
    // console.error('Error updating category:', error);


    res.status(500).json({ error: 'Failed to update category.' });
  }
});

// Delete a category
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Category not found.' });
    res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    // console.error('Error deleting category:', error);


    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

module.exports = router; 