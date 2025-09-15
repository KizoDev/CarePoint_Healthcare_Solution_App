// routes/staffRoutes.js
import express from "express";
import {
  createStaff,
  getAllStaff,
  getSingleStaff,
  updateStaff,
  deleteStaff,
  getStaffShiftHistory,
  toggleMobileAccess,
} from "../controllers/staffController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes below require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Staff management and operations
 */

/**
 * @swagger
 * /staff:
 *   post:
 *     summary: Create a new staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Staff'
 *     responses:
 *       201:
 *         description: Staff created successfully
 *       500:
 *         description: Server error
 */
router.post("/", roleMiddleware(["super_admin", "scheduler"]), createStaff);

/**
 * @swagger
 * /staff:
 *   get:
 *     summary: Get all staff with pagination
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *       - in: query
 *         name: is_available
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Paginated list of staff
 *       500:
 *         description: Server error
 */
router.get("/", roleMiddleware(["super_admin", "scheduler", "authorization", "viewer"]), getAllStaff);

/**
 * @swagger
 * /staff/{id}:
 *   get:
 *     summary: Get a single staff by ID
 *     tags: [Staff]
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
 *         description: Staff details
 *       404:
 *         description: Staff not found
 */
router.get("/:id", roleMiddleware(["super_admin", "scheduler", "authorization", "viewer"]), getSingleStaff);

/**
 * @swagger
 * /staff/{id}:
 *   put:
 *     summary: Update a staff profile
 *     tags: [Staff]
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
 *             $ref: '#/components/schemas/Staff'
 *     responses:
 *       200:
 *         description: Staff updated successfully
 *       404:
 *         description: Staff not found
 */
router.put("/:id", roleMiddleware(["super_admin", "scheduler"]), updateStaff);

/**
 * @swagger
 * /staff/{id}:
 *   delete:
 *     summary: Delete a staff member
 *     tags: [Staff]
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
 *         description: Staff deleted successfully
 *       404:
 *         description: Staff not found
 */
router.delete("/:id", roleMiddleware(["super_admin"]), deleteStaff);

/**
 * @swagger
 * /staff/{id}/shift-history:
 *   get:
 *     summary: Get staff shift history
 *     tags: [Staff]
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
 *         description: List of staff shifts
 *       404:
 *         description: Staff not found
 */
router.get("/:id/shift-history", roleMiddleware(["super_admin", "scheduler", "authorization", "viewer"]), getStaffShiftHistory);

/**
 * @swagger
 * /staff/{id}/toggle-mobile-access:
 *   patch:
 *     summary: Toggle staff mobile app access
 *     tags: [Staff]
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
 *         description: Mobile access toggled successfully
 *       404:
 *         description: Staff not found
 */
router.patch("/:id/toggle-mobile-access", roleMiddleware(["super_admin", "authorization"]), toggleMobileAccess);

export default router;
