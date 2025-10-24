import express from "express";
import {
  createShift,
  updateShift,
  deleteShift,
  assignStaffToShift,
  filterShifts,
  getAllShifts,
  getSingleShift,
  getStaffShiftHistory
} from "../controllers/shiftController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Shifts
 *   description: Shift management endpoints
 */

// All shift routes require login
router.use(authMiddleware);

/**
 * @swagger
 * /shifts/all:
 *   get:
 *     summary: Get all shifts
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all shifts
 */
router.get("/all",authMiddleware, getAllShifts);

/**
 * @swagger
 * /shifts:
 *   get:
 *     summary: Filter shifts
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: string
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Filtered list of shifts
 */
router.get("/get",authMiddleware, filterShifts);

/**
 * @swagger
 * /shifts/{id}:
 *   get:
 *     summary: Get a single shift by ID
 *     tags: [Shifts]
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
 *         description: Shift details
 *       404:
 *         description: Shift not found
 */
router.get("/get/:id",authMiddleware, getSingleShift);

/**
 * @swagger
 * /shifts:
 *   post:
 *     summary: Create a new shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *               staffId:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Shift created successfully
 */
router.post("/create", authMiddleware,createShift);

/**
 * @swagger
 * /shifts/{id}:
 *   put:
 *     summary: Update a shift
 *     tags: [Shifts]
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
 *         description: Shift updated successfully
 *       404:
 *         description: Shift not found
 */
router.put("/:id", authMiddleware,updateShift);

/**
 * @swagger
 * /shifts/{id}:
 *   delete:
 *     summary: Delete a shift
 *     tags: [Shifts]
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
 *         description: Shift deleted successfully
 *       404:
 *         description: Shift not found
 */
router.delete("/:id", authMiddleware, deleteShift);

/**
 * @swagger
 * /shifts/assign:
 *   post:
 *     summary: Assign staff to a shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shiftId:
 *                 type: string
 *               staffId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Staff assigned successfully
 *       404:
 *         description: Shift not found
 */
router.post("/assign",authMiddleware, assignStaffToShift
);
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
router.get("/:id/shift-history",authMiddleware, getStaffShiftHistory);
export default router;
