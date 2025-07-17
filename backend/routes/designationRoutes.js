const express = require('express');
const router = express.Router();
const designationController = require('../controllers/designationController');

// Get all designations
router.get('/', designationController.getDesignations);
// Create a new designation
router.post('/', designationController.createDesignation);
// Update a designation
router.put('/:id', designationController.updateDesignation);
// Delete a designation
router.delete('/:id', designationController.deleteDesignation);

module.exports = router; 