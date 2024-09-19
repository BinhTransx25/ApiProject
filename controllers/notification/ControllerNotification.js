const Notification = require('./ModelNotification');

const getNotifications = async (userId) => {
    try {
        const notifications = await Notification.find({ recipient: userId });
        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw new Error('Error fetching notifications');
    }
};

module.exports = {
    getNotifications,
};
