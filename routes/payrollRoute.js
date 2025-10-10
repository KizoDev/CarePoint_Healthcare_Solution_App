import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createPayrollRun,
  getPayrollRuns,
  getPayrollRunById,
  updatePayrollRun,
  createPayslip,
  getPayslips,
  getPayslipById,
  updatePayslip,
  markPayslipPaid,
} from "../controllers/payrollController.js";

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Payroll
 *   description: Payroll and Payslip Management APIs
 */

/**
 * @swagger
 * /payroll/run/create:
 *   post:
 *     summary: Create a new payroll run
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - period_start
 *               - period_end
 *             properties:
 *               period_start:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-01"
 *               period_end:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-31"
 *     responses:
 *       201:
 *         description: Payroll run created successfully
 *       500:
 *         description: Failed to create payroll run
 */
router.post("/payroll/create",authMiddleware, createPayrollRun);

/**
 * @swagger
 * /payroll/runs:
 *   get:
 *     summary: Get all payroll runs
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: List of payroll runs
 */
router.get("/payroll/get",authMiddleware,  getPayrollRuns);

/**
 * @swagger
 * /payroll/run/{id}:
 *   get:
 *     summary: Get a payroll run by ID
 *     tags: [Payroll]
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
 *         description: Payroll run details
 *       404:
 *         description: Payroll run not found
 */
router.get("/payroll/get/:id",authMiddleware,  getPayrollRunById);

/**
 * @swagger
 * /payroll/run/{id}:
 *   put:
 *     summary: Update a payroll run
 *     tags: [Payroll]
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
 *             example:
 *               period_start: "2025-01-01"
 *               period_end: "2025-01-31"
 *     responses:
 *       200:
 *         description: Payroll run updated
 *       404:
 *         description: Payroll run not found
 */
router.put("/payroll/update/:id",authMiddleware,  updatePayrollRun);

/**
 * @swagger
 * /payroll/payslip/create:
 *   post:
 *     summary: Create a payslip for a staff under a payroll run
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payroll_run_id
 *               - staff_id
 *               - gross_pay
 *               - deductions
 *               - net_pay
 *             properties:
 *               payroll_run_id:
 *                 type: string
 *                 example: "3d5f204c-bd2e-4f88-a92d-123456789abc"
 *               staff_id:
 *                 type: string
 *                 example: "7d9a72b4-f53e-49b8-ae23-9f987e1c22bb"
 *               gross_pay:
 *                 type: number
 *                 example: 500000
 *               deductions:
 *                 type: number
 *                 example: 50000
 *               net_pay:
 *                 type: number
 *                 example: 450000
 *     responses:
 *       201:
 *         description: Payslip created successfully
 *       500:
 *         description: Failed to create payslip
 */
router.post("/payslip/create",authMiddleware,  createPayslip);

/**
 * @swagger
 * /payroll/payslips:
 *   get:
 *     summary: Get all payslips
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: string
 *       - in: query
 *         name: payrollRunId
 *         schema:
 *           type: string
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
 *         description: List of payslips
 */
router.get("/payslip/get",authMiddleware,  getPayslips);

/**
 * @swagger
 * /payroll/payslip/{id}:
 *   get:
 *     summary: Get payslip by ID
 *     tags: [Payroll]
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
 *         description: Payslip details
 *       404:
 *         description: Payslip not found
 */
router.get("/payslip/get/:id",authMiddleware,  getPayslipById);

/**
 * @swagger
 * /payroll/payslip/{id}:
 *   put:
 *     summary: Update a payslip (e.g. after deductions or adjustments)
 *     tags: [Payroll]
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
 *             example:
 *               gross_pay: 550000
 *               deductions: 50000
 *               net_pay: 500000
 *     responses:
 *       200:
 *         description: Payslip updated
 *       404:
 *         description: Payslip not found
 */
router.put("/payslip/update/:id",authMiddleware,  updatePayslip);

/**
 * @swagger
 * /payroll/payslip/{id}/paid:
 *   patch:
 *     summary: Mark a payslip as paid
 *     tags: [Payroll]
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
 *         description: Payslip marked as paid
 *       404:
 *         description: Payslip not found
 */
router.patch("/payslip/paid/:id",authMiddleware,  markPayslipPaid);

export default router;
