import express from "express";
import {
  checkIn,
  checkOut,
  requestLeave,
  updateLeaveStatus,
} from "../controllers/attendanceController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance and Leave Management
 */

router.use(authMiddleware);

/**
 * @swagger
 * /attendance/checkin:
 *   post:
 *     summary: Staff check-in
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff checked in successfully
 *       400:
 *         description: Already checked in or invalid request
 */
router.post("/checkin",authMiddleware, checkIn);

/**
 * @swagger
 * /attendance/checkout:
 *   post:
 *     summary: Staff check-out
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff checked out successfully
 *       400:
 *         description: Already checked out or invalid request
 */
router.post("/checkout",authMiddleware, checkOut);

/**
 * @swagger
 * /attendance/leave:
 *   post:
 *     summary: Staff submit leave request
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - start_date
 *               - end_date
 *               - reason
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Leave request submitted successfully
 *       400:
 *         description: Invalid request
 */
router.post("/leave",authMiddleware, requestLeave);

/**
 * @swagger
 * /attendance/leave/{id}:
 *   patch:
 *     summary: Approve or reject a leave request
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Approved, Rejected]
 *     responses:
 *       200:
 *         description: Leave status updated
 *       404:
 *         description: Leave request not found
 */
router.patch(
  "/leave/:id",authMiddleware,
  updateLeaveStatus
);

export default router;
