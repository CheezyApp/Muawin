const Designation = require('../models/Designation');

// Get all designations
exports.getDesignations = async (req, res) => {
  try {
    const designations = await Designation.find().sort({ name: 1 });
    res.json(designations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch designations' });
  }
};

// Create a new designation
exports.createDesignation = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const exists = await Designation.findOne({ name });
    if (exists) return res.status(409).json({ error: 'Designation already exists' });
    const designation = new Designation({ name });
    await designation.save();
    res.status(201).json(designation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create designation' });
  }
};

// Update a designation
exports.updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const exists = await Designation.findOne({ name, _id: { $ne: id } });
    if (exists) return res.status(409).json({ error: 'Designation already exists' });
    const designation = await Designation.findByIdAndUpdate(id, { name }, { new: true });
    if (!designation) return res.status(404).json({ error: 'Designation not found' });
    res.json(designation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update designation' });
  }
};

// Delete a designation
exports.deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const designation = await Designation.findByIdAndDelete(id);
    if (!designation) return res.status(404).json({ error: 'Designation not found' });
    res.json({ message: 'Designation deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete designation' });
  }
}; 