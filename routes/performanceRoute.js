import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../controllers/performanceController.js";

const router = express.Router();

// 🔐 All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Performance
 *   description: Performance review and goal management (HR access only)
 */

/**
 * @swagger
 * /performance/reviews:
 *   post:
 *     summary: Create a performance review (HR only)
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               staffId:
 *                 type: string
 *                 format: uuid
 *               score:
 *                 type: number
 *               comments:
 *                 type: string
 *               review_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Review created successfully
 */
router.post("/reviews",authMiddleware, createReview);

/**
 * @swagger
 * /performance/reviews:
 *   get:
 *     summary: Get all performance reviews (HR only)
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get("/reviews",authMiddleware, getReviews);

/**
 * @swagger
 * /performance/reviews/{id}:
 *   get:
 *     summary: Get a specific performance review by ID
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Review details
 *       404:
 *         description: Review not found
 */
router.get("/reviews/:id",authMiddleware, getReviewById);

/**
 * @swagger
 * /performance/reviews/{id}:
 *   put:
 *     summary: Update a performance review (HR only)
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Review updated
 *       404:
 *         description: Not found
 */
router.put("/reviews/:id",authMiddleware, updateReview);

/**
 * @swagger
 * /performance/reviews/{id}:
 *   delete:
 *     summary: Delete a performance review (HR only)
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Review deleted
 *       404:
 *         description: Not found
 */
router.delete("/reviews/:id",authMiddleware, deleteReview);

/**
 * @swagger
 * /performance/goals:
 *   post:
 *     summary: Create a new goal (HR only)
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               staffId:
 *                 type: string
 *                 format: uuid
 *               description:
 *                 type: string
 *               target_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Goal created successfully
 */
router.post("/goals",authMiddleware, createGoal);

/**
 * @swagger
 * /performance/goals/{id}:
 *   put:
 *     summary: Update an existing goal (HR only)
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Goal updated
 */
router.put("/goals/:id",authMiddleware, updateGoal);

/**
 * @swagger
 * /performance/goals/{id}:
 *   delete:
 *     summary: Delete a goal (HR only)
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Goal deleted
 */
router.delete("/goals/:id",authMiddleware, deleteGoal);

export default router;
