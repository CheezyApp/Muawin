const Zone = require('../models/Zone');

// Function to initialize zones and branches in the database
const initializeZones = async () => {
  const initialZones = {
    'Zone A': ['Cheezious Headquarters', 'Cheezious I-8', 'Cheezious F-7/1', 'Cheezious F-7/2', 'Cheezious G-9'],
    'Zone B': ['Cheezious F-10', 'Cheezious F-11', 'Cheezious E-11', 'Cheezious WAH CANTT', 'Cheezious G-13', 'Cheezious GOLRA'],
    'Zone C': ['Cheezious SADDAR', 'Cheezious Commercial 1 & 2', 'Cheezious OLD WORKSHOP', 'Cheezious Support Center'],
    'Zone D': ['Cheezious GHAURI TOWN', 'Cheezious TRAMRI', 'Cheezious PWD', 'Cheezious SCHEME 3'],
    'Zone E': ['Cheezious ADYALA', 'Cheezious KALMA', 'Cheezious BAHRIA', 'Cheezious ZARAJ GT ROAD', 'Cheezious GIGA', 'Cheezious Warehouse HUMAK'],
    'Zone F': ['Cheezious PESHAWAR', 'Cheezious MARDAN'],
  };

  try {
    // Check if zones already exist
    const zoneCount = await Zone.countDocuments();
    
    if (zoneCount === 0) {
      // Insert the initial zones into the database
      const zonesToInsert = Object.keys(initialZones).map((zoneName) => ({
        zoneName,
        branches: initialZones[zoneName],
      }));

      await Zone.insertMany(zonesToInsert);

      // console.log('Initial zones and branches added to MongoDB');

    } else {
      // console.log('Zones already exist in MongoDB');

    }
  } catch (error) {
    // console.error('Error initializing zones:', error);

  }
};

// API to get all zones and branches
const getAllZones = async (req, res) => {
  try {
    const zones = await Zone.find(); // Fetch all zones

    // console.log('Fetched zones from database:', zones);


    res.status(200).json(zones);
  } catch (error) {
    // console.error('Error fetching zones:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

// API to get branches for a specific zone
const getBranchesByZone = async (req, res) => {
  const zoneName = req.params.zoneName;
  try {
    const zone = await Zone.findOne({ zoneName });
    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }
    res.status(200).json(zone.branches);
  } catch (error) {
    // console.error('Error fetching branches:', error);


    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// API to add a branch to a specific zone
const addBranchToZone = async (req, res) => {
  try {
    const { zoneName } = req.params;
    const { branchName } = req.body;

    const zone = await Zone.findOne({ zoneName }); // Find the zone by name
    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    // Add the new branch to the zone
    zone.branches.push(branchName);
    await zone.save();

    res.status(200).json({ message: `Branch ${branchName} added to zone ${zoneName}`, zone });
  } catch (error) {
    // console.error('Error adding branch:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

// API to update a branch name in a specific zone
const updateBranchInZone = async (req, res) => {
  try {
    const { zoneName } = req.params;
    const { oldBranchName, newBranchName } = req.body;

    const zone = await Zone.findOne({ zoneName });

    // console.log("Fetched Zone:", zone);


    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    // Find the branch index and update the branch name
    const branchIndex = zone.branches.indexOf(oldBranchName);

    // console.log("Branch Index:", branchIndex);


    if (branchIndex === -1) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    if (newBranchName) {
      // Edit the branch name
      zone.branches[branchIndex] = newBranchName;
    } else {
      // Remove the branch
      zone.branches.splice(branchIndex, 1);
    }

    await zone.save();

    res.status(200).json({ message: `Branch ${oldBranchName} updated successfully`, zone });
  } catch (error) {
    // console.error('Error updating branch:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE API to delete a branch from a specific zone
const deleteBranchFromZone = async (req, res) => {
  try {
    const { zoneName } = req.params;
    const { branchName } = req.body;

    // Find the zone by name
    const zone = await Zone.findOne({ zoneName });

    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    // Find the index of the branch to delete
    const branchIndex = zone.branches.indexOf(branchName);

    if (branchIndex === -1) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Remove the branch
    zone.branches.splice(branchIndex, 1);
    await zone.save();

    res.status(200).json({ message: `Branch ${branchName} removed successfully`, zone });
  } catch (error) {
    // console.error('Error deleting branch:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  initializeZones,
  getAllZones,
  getBranchesByZone,
  addBranchToZone,
  updateBranchInZone,
  deleteBranchFromZone,
}; 