const Notification = require('../models/Notification');
const User = require('../models/User');

// Get notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have user info in req.user from auth middleware
    const { limit = 20, skip = 0 } = req.query;

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Notification.countDocuments({ recipient: userId });
    const unread = await Notification.countDocuments({ recipient: userId, read: false });

    res.status(200).json({
      notifications,
      total,
      unread
    });
  } catch (error) {
    // console.error('Error fetching notifications:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notifications as read
const markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user._id;

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        recipient: userId
      },
      { $set: { read: true } }
    );

    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    // console.error('Error marking notifications as read:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

// Helper functions for creating notifications
const createNotification = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();
    return notification;
  } catch (error) {
    // console.error('Error creating notification:', error);


    throw error;
  }
};

const createNotificationsForUsers = async (users, data) => {
  try {
    const notifications = users.map(user => ({
      ...data,
      recipient: user._id
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    // console.error('Error creating notifications for users:', error);


    throw error;
  }
};

const createNotificationsForZoneBranch = async (zone, branch, data) => {
  try {
    const query = {};
    if (zone) query.zone = zone;
    if (branch) query.branch = branch;

    const users = await User.find(query);
    await createNotificationsForUsers(users, data);
  } catch (error) {
    // console.error('Error creating notifications for zone/branch:', error);


    throw error;
  }
};

// Export the controller functions
module.exports = {
  getUserNotifications,
  markAsRead,
  createNotification,
  createNotificationsForUsers,
  createNotificationsForZoneBranch
}; 