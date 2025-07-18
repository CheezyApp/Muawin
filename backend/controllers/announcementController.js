const Announcement = require('../models/Announcement');

// API to add a new announcement
const addAnnouncement = async (req, res) => {
  try {
    const { announcement, createdBy } = req.body;

    // Create a new announcement object
    const newAnnouncement = new Announcement({
      announcement,
      createdBy,
    });

    // Save the announcement to the database
    await newAnnouncement.save();

    res.status(201).json({ message: 'Announcement created successfully', announcement: newAnnouncement });
  } catch (error) {
    // console.error('Error creating announcement:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

// API to get all announcements
const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find(); // Fetch all announcements
    res.status(200).json(announcements);
  } catch (error) {
    // console.error('Error fetching announcements:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

// API to get the latest announcement
const getLatestAnnouncement = async (req, res) => {
  try {
    const latestAnnouncement = await Announcement.findOne().sort({ createdAt: -1 });
    res.status(200).json(latestAnnouncement);
  } catch (error) {
    // console.error('Error fetching the latest announcement:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addAnnouncement,
  getAllAnnouncements,
  getLatestAnnouncement,
}; 