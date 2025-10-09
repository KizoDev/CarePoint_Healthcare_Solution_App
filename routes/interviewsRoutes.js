// routes/interviewRoute.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  scheduleInterview,
  updateInterview,
  cancelInterview,
  getInterviews,
  getInterviewById,
} from "../controllers/interviewsController.js";

const router = express.Router();
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Interviews
 *   description: Manage recruitment interviews
 */

/**
 * @swagger
 * /interviews:
 *   post:
 *     summary: Schedule a new interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - application_id
 *               - interviewer_staff_id
 *               - scheduled_at
 *               - mode
 *             properties:
 *               application_id:
 *                 type: string
 *               interviewer_staff_id:
 *                 type: string
 *               scheduled_at:
 *                 type: string
 *                 format: date-time
 *               mode:
 *                 type: string
 *                 enum: [online, onsite, phone]
 *               location:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Interview scheduled
 *       404:
 *         description: Application not found
 *       500:
 *         description: Failed to schedule interview
 */
router.post("/create", authMiddleware, scheduleInterview);

/**
 * @swagger
 * /interviews/{id}:
 *   put:
 *     summary: Update an interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Interview updated
 *       404:
 *         description: Interview not found
 *       500:
 *         description: Failed to update interview
 */
router.put("/:id",authMiddleware, updateInterview);

/**
 * @swagger
 * /interviews/{id}/cancel:
 *   patch:
 *     summary: Cancel an interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Interview cancelled
 *       404:
 *         description: Interview not found
 *       500:
 *         description: Failed to cancel interview
 */
router.patch("/:id/cancel", authMiddleware, cancelInterview);

/**
 * @swagger
 * /interviews:
 *   get:
 *     summary: List all interviews
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: application_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: interviewer_staff_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of interviews
 *       500:
 *         description: Failed to fetch interviews
 */
router.get("/",authMiddleware, getInterviews);

/**
 * @swagger
 * /interviews/{id}:
 *   get:
 *     summary: Get interview by ID
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Interview details
 *       404:
 *         description: Interview not found
 *       500:
 *         description: Failed to fetch interview
 */
router.get("/:id", authMiddleware, getInterviewById);

export default router;
