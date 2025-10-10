// routes/shiftTemplateRoutes.js
import express from "express";
import {
  createShiftTemplate,
  getAllTemplates,
  deleteTemplate
} from "../controllers/shiftTemplateControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ShiftTemplates
 *   description: Manage reusable shift templates
 */
router.use(authMiddleware);

/**
 * @swagger
 * /shift-templates:
 *   post:
 *     summary: Create a new shift template
 *     tags: [ShiftTemplates]
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
 *               name:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Template created successfully
 *       500:
 *         description: Error creating template
 */
router.post("/create",authMiddleware, createShiftTemplate);

/**
 * @swagger
 * /shift-templates:
 *   get:
 *     summary: Get all shift templates
 *     tags: [ShiftTemplates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all shift templates
 *       500:
 *         description: Error fetching templates
 */
router.get("/get", authMiddleware, getAllTemplates);

/**
 * @swagger
 * /shift-templates/{id}:
 *   delete:
 *     summary: Delete a shift template
 *     tags: [ShiftTemplates]
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
 *         description: Template deleted successfully
 *       500:
 *         description: Error deleting template
 */
router.delete("/delete/:id",authMiddleware, deleteTemplate);

export default router;
