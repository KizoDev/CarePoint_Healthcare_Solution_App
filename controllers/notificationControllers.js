import db from "../models/index.js";

const { Notification, Staff, Client } = db;

// Create a notification
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, staffId, clientId } = req.body;

    const notification = await Notification.create({
      title,
      message,
      type,
      staffId: staffId || null,
      clientId: clientId || null,
    });

    // Emit real-time notification
    const io = req.app.get("io");
    if (io) {
      io.emit("newNotification", notification); // broadcast to all
      if (staffId) io.to(staffId).emit("newNotification", notification); // targeted
      if (clientId) io.to(clientId).emit("newNotification", notification); // targeted
    }

    res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: Staff, as: "staff" },
        { model: Client, as: "client" },
      ],
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.update({ read: true });
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
