import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL;

const getNotifications = async (limit = 20, skip = 0) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/notifications?limit=${limit}&skip=${skip}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    // console.error('Error fetching notifications:', error);


    throw error;
  }
};

const markAsRead = async (notificationIds) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/notifications/mark-read`,
      { notificationIds },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    // console.error('Error marking notifications as read:', error);


    throw error;
  }
};

export const notificationService = {
  getNotifications,
  markAsRead
}; 