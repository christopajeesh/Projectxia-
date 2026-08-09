import { memoryStore } from '../seed/seedData.js';

// @desc    Get user notifications
// @route   GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || 'user_001_buyer';
    const userNotifications = memoryStore.notifications.filter(
      n => n.userId === userId || n.userId === 'all'
    );

    res.json({
      success: true,
      count: userNotifications.length,
      notifications: userNotifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = memoryStore.notifications.find(n => n._id === id);

    if (notif) {
      notif.isRead = true;
    }

    res.json({
      success: true,
      message: 'Notification marked as read.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
