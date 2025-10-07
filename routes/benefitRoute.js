// routes/benefits.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createBenefitPlan,
  getBenefitPlans,
  assignStaffBenefit,
  getStaffBenefits,
  removeStaffBenefit,
} from "../controllers/benefitController.js";

const router = express.Router();
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Benefits
 *   description: Benefit management endpoints
 */

/**
 * @swagger
 * /benefits/plans:
 *   post:
 *     summary: Create a new benefit plan
 *     tags: [Benefits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [health, pension, insurance, other]
 *     responses:
 *       201:
 *         description: Benefit plan created successfully
 *       500:
 *         description: Failed to create benefit plan
 */
router.post("/plans",authMiddleware, createBenefitPlan);

/**
 * @swagger
 * /benefits/plans:
 *   get:
 *     summary: Get all benefit plans
 *     tags: [Benefits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of benefit plans
 *       500:
 *         description: Failed to fetch benefit plans
 */
router.get("/plans",authMiddleware, getBenefitPlans);

/**
 * @swagger
 * /benefits/assign:
 *   post:
 *     summary: Assign a benefit plan to a staff
 *     tags: [Benefits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - staffId
 *               - planId
 *             properties:
 *               staffId:
 *                 type: string
 *               planId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Staff benefit assigned successfully
 *       500:
 *         description: Failed to assign benefit
 */
router.post("/assign", authMiddleware, assignStaffBenefit);

/**
 * @swagger
 * /benefits/staff:
 *   get:
 *     summary: Get all benefits assigned to staff
 *     tags: [Benefits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter benefits by staff ID
 *     responses:
 *       200:
 *         description: List of staff benefits
 *       500:
 *         description: Failed to fetch staff benefits
 */
router.get("/staff", authMiddleware, getStaffBenefits);

/**
 * @swagger
 * /benefits/assign/{id}:
 *   delete:
 *     summary: Remove a staff benefit by ID
 *     tags: [Benefits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: StaffBenefit enrollment ID
 *     responses:
 *       200:
 *         description: Staff benefit removed successfully
 *       404:
 *         description: StaffBenefit not found
 *       500:
 *         description: Failed to remove staff benefit
 */
router.delete("/assign/:id", authMiddleware, removeStaffBenefit);

export default router;
