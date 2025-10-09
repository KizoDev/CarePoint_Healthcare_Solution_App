// routes/staffRoutes.js
import express from "express";
import {
  inviteStaff,
  getAllStaff,
  getSingleStaff,
  updateStaff,
  deleteStaff,
  updatePermissions,
  loginStaff
} from "../controllers/staffController.js";

import authMiddleware from "../middleware/authMiddleware.js";

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
router.post("/createstaff", authMiddleware, inviteStaff);

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
router.get("/getAll",authMiddleware , getAllStaff);

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
router.get("/getOne/:id", authMiddleware, getSingleStaff);

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
router.put("/update/:id", authMiddleware, updateStaff);

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
router.delete("/delete/:id",authMiddleware, deleteStaff);



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
router.patch("/:id/toggle-mobile-access", authMiddleware, updatePermissions);

/**
 * @swagger
 * /staff/login:
 *   post:
 *     summary: Staff login
 *     tags: [Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: staff.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token and staff details
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post("/login", loginStaff); // ✅ Public login route


export default router;
