// routes/candidates.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
} from "../controllers/candidateControllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Candidates
 *   description: Candidate management endpoints
 */

/**
 * @swagger
 * /candidates:
 *   post:
 *     summary: Create a candidate profile
 *     tags: [Candidates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - phone
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               resume_url:
 *                 type: string
 *                 format: uri
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *       500:
 *         description: Failed to create candidate
 */
router.post("/", createCandidate);

// Admin-only routes
router.use(authMiddleware);

/**
 * @swagger
 * /candidates:
 *   get:
 *     summary: Get all candidates
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: false
 *         description: Search candidates by full name
 *     responses:
 *       200:
 *         description: List of candidates
 *       500:
 *         description: Failed to fetch candidates
 */
router.get("/", roleMiddleware(["super_admin", "authorization"]), getCandidates);

/**
 * @swagger
 * /candidates/{id}:
 *   get:
 *     summary: Get candidate by ID
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: Candidate details
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Failed to fetch candidate
 */
router.get("/:id", roleMiddleware(["super_admin", "authorization"]), getCandidateById);

/**
 * @swagger
 * /candidates/{id}:
 *   put:
 *     summary: Update candidate by ID
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Candidate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               resume_url:
 *                 type: string
 *                 format: uri
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Candidate updated successfully
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Failed to update candidate
 */
router.put("/:id", roleMiddleware(["super_admin", "authorization"]), updateCandidate);

/**
 * @swagger
 * /candidates/{id}:
 *   delete:
 *     summary: Delete candidate by ID
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: Candidate deleted successfully
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Failed to delete candidate
 */
router.delete("/:id", roleMiddleware(["super_admin"]), deleteCandidate);

export default router;
