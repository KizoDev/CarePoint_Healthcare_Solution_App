import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  applyToJob,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
} from "../controllers/jobApplicationController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: JobApplications
 *   description: Manage job applications
 */

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Apply to a job
 *     tags: [JobApplications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - job_posting_id
 *               - candidate_id
 *             properties:
 *               job_posting_id:
 *                 type: string
 *                 example: "1"
 *               candidate_id:
 *                 type: string
 *                 example: "5"
 *               cover_letter:
 *                 type: string
 *                 example: "I am excited to apply for this role..."
 *     responses:
 *       201:
 *         description: Application submitted
 *       400:
 *         description: Invalid or closed job posting / candidate not found
 *       500:
 *         description: Failed to submit application
 */
router.post("/", applyToJob);

/**
 * @swagger
 * /applications/{id}/withdraw:
 *   patch:
 *     summary: Withdraw a job application
 *     tags: [JobApplications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application withdrawn
 *       404:
 *         description: Application not found
 *       500:
 *         description: Failed to withdraw application
 */
router.patch("/:id/withdraw", withdrawApplication);

// ---------- Protected Admin routes ----------
router.use(authMiddleware);

/**
 * @swagger
 * /applications:
 *   get:
 *     summary: Get all job applications
 *     tags: [JobApplications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by application status
 *       - in: query
 *         name: job_posting_id
 *         schema:
 *           type: string
 *         description: Filter by job posting
 *       - in: query
 *         name: candidate_id
 *         schema:
 *           type: string
 *         description: Filter by candidate
 *     responses:
 *       200:
 *         description: List of applications
 *       500:
 *         description: Failed to fetch applications
 */
router.get("/", roleMiddleware(["super_admin", "authorization"]), getApplications);

/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     summary: Get application by ID
 *     tags: [JobApplications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application details
 *       404:
 *         description: Application not found
 *       500:
 *         description: Failed to fetch application
 */
router.get("/:id", roleMiddleware(["super_admin", "authorization"]), getApplicationById);

/**
 * @swagger
 * /applications/{id}/status:
 *   patch:
 *     summary: Update application status
 *     tags: [JobApplications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
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
 *                 enum: [shortlisted, interviewed, offered, rejected, hired]
 *                 example: shortlisted
 *     responses:
 *       200:
 *         description: Application status updated
 *       404:
 *         description: Application not found
 *       500:
 *         description: Failed to update status
 */
router.patch("/:id/status", roleMiddleware(["super_admin", "authorization"]), updateApplicationStatus);

export default router;
