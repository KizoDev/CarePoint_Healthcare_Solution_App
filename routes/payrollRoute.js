// routes/payroll.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createPayrollRun,
  getPayrollRuns,
  getPayrollRunById,
  updatePayrollRun,
  getPayslips,
  getPayslipById,
  updatePayslip,
  markPayslipPaid,
} from "../controllers/payrollController.js";

const router = express.Router();
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Payroll
 *   description: Payroll management APIs
 */

/**
 * @swagger
 * /payroll/runs:
 *   post:
 *     summary: Create a payroll run
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               period_start:
 *                 type: string
 *                 format: date
 *               period_end:
 *                 type: string
 *                 format: date
 *               staffIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Payroll run created
 *       500:
 *         description: Failed to create payroll run
 */
router.post("/runs", authorizeRoles("super_admin", "authorization"), createPayrollRun);

/**
 * @swagger
 * /payroll/runs:
 *   get:
 *     summary: Get all payroll runs
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: List of payroll runs
 */
router.get("/runs", authorizeRoles("super_admin", "authorization", "viewer"), getPayrollRuns);

/**
 * @swagger
 * /payroll/runs/{id}:
 *   get:
 *     summary: Get payroll run by ID
 *     tags: [Payroll]
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
 *         description: Payroll run details
 *       404:
 *         description: Not found
 */
router.get("/runs/:id", authorizeRoles("super_admin", "authorization", "viewer"), getPayrollRunById);

/**
 * @swagger
 * /payroll/runs/{id}:
 *   put:
 *     summary: Update payroll run
 *     tags: [Payroll]
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
 *         description: Payroll run updated
 *       404:
 *         description: Not found
 */
router.put("/runs/:id", authorizeRoles("super_admin", "authorization"), updatePayrollRun);

/**
 * @swagger
 * /payroll/payslips:
 *   get:
 *     summary: Get all payslips
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: staffId
 *         in: query
 *         schema:
 *           type: integer
 *       - name: payrollRunId
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
 *         description: List of payslips
 */
router.get("/payslips", authorizeRoles("super_admin", "authorization", "viewer"), getPayslips);

/**
 * @swagger
 * /payroll/payslips/{id}:
 *   get:
 *     summary: Get payslip by ID
 *     tags: [Payroll]
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
 *         description: Payslip details
 *       404:
 *         description: Not found
 */
router.get("/payslips/:id", authorizeRoles("super_admin", "authorization", "viewer"), getPayslipById);

/**
 * @swagger
 * /payroll/payslips/{id}:
 *   put:
 *     summary: Update payslip
 *     tags: [Payroll]
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
 *         description: Payslip updated
 *       404:
 *         description: Not found
 */
router.put("/payslips/:id", authorizeRoles("super_admin", "authorization"), updatePayslip);

/**
 * @swagger
 * /payroll/payslips/{id}/paid:
 *   patch:
 *     summary: Mark payslip as paid
 *     tags: [Payroll]
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
 *         description: Payslip marked as paid
 *       404:
 *         description: Not found
 */
router.patch("/payslips/:id/paid", authorizeRoles("super_admin", "authorization"), markPayslipPaid);

export default router;
