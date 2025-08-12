import express from "express";
import {
  createNotification,
  getNotifications,
  markAsRead,
} from "../controllers/notificationControllers.js";

const router = express.Router();

router.post("/", createNotification);
router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);

export default router;
