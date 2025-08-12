// utils/notify.js
export const sendNotification = (req, recipients, event, data) => {
  const io = req.app.get("io");
  if (!io) return;

  recipients.forEach(userId => {
    const socketId = req.app.get("userSocketMap")?.[userId];
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  });
};
