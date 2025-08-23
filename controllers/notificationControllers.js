// controllers/notificationController.js
import db from "../models/index.js";
const { Notification, Staff, Client } = db;

// Get notifications for a specific recipient
export const getNotifications = async (req, res) => {
  try {
    const { userId, role } = req.params;       // role can be 'staff' or 'client'

    const where = {};
    if (role === "staff") where.staffId = userId;
    if (role === "client") where.clientId = userId;

    const notifications = await Notification.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        { model: Staff, as: "staff", attributes: ["id", "name"] },
        { model: Client, as: "client", attributes: ["id", "name"] },
      ],
    });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to load notifications", error });
  }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params; // notification ID
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification", error });
  }
};
