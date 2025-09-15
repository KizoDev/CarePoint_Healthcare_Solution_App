// routes/notification.js
import express from "express";
import {
  getNotifications,
  markAsRead,
} from "../controllers/notificationControllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Manage notifications for staff and clients
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications for a specific user
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the staff or client
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [staff, client]
 *         description: Role of the recipient (staff or client)
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   message:
 *                     type: string
 *                   read:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Failed to load notifications
 */
router.get("/", getNotifications);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Failed to update notification
 */
router.patch("/:id/read", markAsRead);

export default router;
