// routes/performance.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createReview, getReviews, getReviewById, updateReview, deleteReview,
  createGoal, updateGoal, deleteGoal
} from "../controllers/performanceController.js";

const router = express.Router();
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Performance
 *   description: Employee performance management
 */

/**
 * @swagger
 * /performance/reviews:
 *   post:
 *     summary: Create a performance review
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
 *                 type: integer
 *               score:
 *                 type: number
 *               comments:
 *                 type: string
 *               review_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Review created
 */
router.post("/reviews", authorizeRoles("super_admin", "authorization"), createReview);

/**
 * @swagger
 * /performance/reviews:
 *   get:
 *     summary: Get all performance reviews
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: staffId
 *         in: query
 *         schema:
 *           type: integer
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get("/reviews", authorizeRoles("super_admin", "authorization", "viewer", "scheduler"), getReviews);

/**
 * @swagger
 * /performance/reviews/{id}:
 *   get:
 *     summary: Get review by ID
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Review details
 *       404:
 *         description: Not found
 */
router.get("/reviews/:id", authorizeRoles("super_admin", "authorization", "viewer", "scheduler"), getReviewById);

/**
 * @swagger
 * /performance/reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
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
router.put("/reviews/:id", authorizeRoles("super_admin", "authorization"), updateReview);

/**
 * @swagger
 * /performance/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Review deleted
 *       404:
 *         description: Not found
 */
router.delete("/reviews/:id", authorizeRoles("super_admin"), deleteReview);

/**
 * @swagger
 * /performance/goals:
 *   post:
 *     summary: Create a goal
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
 *                 type: integer
 *               description:
 *                 type: string
 *               target_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Goal created
 */
router.post("/goals", authorizeRoles("super_admin", "authorization"), createGoal);

/**
 * @swagger
 * /performance/goals/{id}:
 *   put:
 *     summary: Update a goal
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Goal updated
 *       404:
 *         description: Not found
 */
router.put("/goals/:id", authorizeRoles("super_admin", "authorization"), updateGoal);

/**
 * @swagger
 * /performance/goals/{id}:
 *   delete:
 *     summary: Delete a goal
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Goal deleted
 *       404:
 *         description: Not found
 */
router.delete("/goals/:id", authorizeRoles("super_admin"), deleteGoal);

export default router;
