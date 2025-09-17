// routes/auditRoutes.js
import express from "express";
import { getAuditLogs } from "../controllers/auditController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AuditLogs
 *   description: System audit log management
 */

/**
 * @swagger
 * /audit:
 *   get:
 *     summary: Retrieve all audit logs (super admin only)
 *     tags: [AuditLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by Admin ID
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *         description: Filter by module name (e.g., Shift, Staff, Payroll)
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action performed (e.g., CREATE, UPDATE, DELETE)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: List of audit logs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not super admin)
 */
router.get("/", authMiddleware, roleMiddleware("Super_admin"), getAuditLogs);

export default router;
