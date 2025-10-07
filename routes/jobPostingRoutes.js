import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  createJobPosting,
  getJobPostings,
  getJobPostingById,
  updateJobPosting,
  closeJobPosting,
  deleteJobPosting,
} from "../controllers/jobPostingCotrollers.js";

const router = express.Router();
// Protect the routes below
router.use(authMiddleware);
/**
 * @swagger
 * tags:
 *   name: JobPostings
 *   description: Manage job postings
 */

/**
 * @swagger
 * /job-postings:
 *   get:
 *     summary: Get all job postings
 *     tags: [JobPostings]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by job status (open/closed)
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by job title
 *     responses:
 *       200:
 *         description: List of job postings
 *       500:
 *         description: Failed to fetch job postings
 */
router.get("/get",authMiddleware, getJobPostings);

/**
 * @swagger
 * /job-postings/{id}:
 *   get:
 *     summary: Get a job posting by ID
 *     tags: [JobPostings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job posting ID
 *     responses:
 *       200:
 *         description: Job posting details
 *       404:
 *         description: Job posting not found
 *       500:
 *         description: Failed to fetch job posting
 */
router.get("/get/:id",authMiddleware, getJobPostingById);



/**
 * @swagger
 * /job-postings:
 *   post:
 *     summary: Create a new job posting
 *     tags: [JobPostings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - department
 *               - description
 *               - employment_type
 *             properties:
 *               title:
 *                 type: string
 *               department:
 *                 type: string
 *               description:
 *                 type: string
 *               employment_type:
 *                 type: string
 *               location:
 *                 type: string
 *               salary_range:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job posting created
 *       500:
 *         description: Failed to create job posting
 */
router.post("/create", authMiddleware, createJobPosting);

/**
 * @swagger
 * /job-postings/{id}:
 *   put:
 *     summary: Update a job posting
 *     tags: [JobPostings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               department:
 *                 type: string
 *               description:
 *                 type: string
 *               employment_type:
 *                 type: string
 *               location:
 *                 type: string
 *               salary_range:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job posting updated
 *       404:
 *         description: Job posting not found
 *       500:
 *         description: Failed to update job posting
 */
router.put("/:id", authMiddleware, updateJobPosting);

/**
 * @swagger
 * /job-postings/{id}/close:
 *   patch:
 *     summary: Close a job posting
 *     tags: [JobPostings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Job posting closed
 *       404:
 *         description: Job posting not found
 *       500:
 *         description: Failed to close job posting
 */
router.patch("/:id/close", authMiddleware, closeJobPosting);

/**
 * @swagger
 * /job-postings/{id}:
 *   delete:
 *     summary: Delete a job posting
 *     tags: [JobPostings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Job posting deleted
 *       404:
 *         description: Job posting not found
 *       500:
 *         description: Failed to delete job posting
 */
router.delete("/:id", authMiddleware, deleteJobPosting);

export default router;
