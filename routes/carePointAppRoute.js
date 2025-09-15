// routes/carePointRoute.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  changeApplicationStatus,
  deleteApplication,
} from "../controllers/carePointAppController.js";

const router = express.Router();
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

router.use(authMiddleware);

/**
 * @swagger
 * /carepoint:
 *   post:
 *     summary: Create a new CarePoint application
 *     tags: [CarePoint Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               staff_id:
 *                 type: string
 *               application_type:
 *                 type: string
 *               details:
 *                 type: object
 *     responses:
 *       201:
 *         description: Application created successfully
 *       500:
 *         description: Failed to create application
 */
router.post("/", authorizeRoles("super_admin", "authorization"), createApplication);

/**
 * @swagger
 * /carepoint:
 *   get:
 *     summary: Get all CarePoint applications
 *     tags: [CarePoint Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
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
 *         description: List of applications
 *       500:
 *         description: Failed to fetch applications
 */
router.get("/", authorizeRoles("super_admin", "authorization", "scheduler", "viewer"), getApplications);

/**
 * @swagger
 * /carepoint/{id}:
 *   get:
 *     summary: Get a CarePoint application by ID
 *     tags: [CarePoint Applications]
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
 *         description: Application details
 *       404:
 *         description: Application not found
 *       500:
 *         description: Failed to fetch application
 */
router.get("/:id", authorizeRoles("super_admin", "authorization", "scheduler", "viewer"), getApplicationById);

/**
 * @swagger
 * /carepoint/{id}:
 *   put:
 *     summary: Update a CarePoint application
 *     tags: [CarePoint Applications]
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
 *         description: Application updated successfully
 *       404:
 *         description: Application not found
 *       500:
 *         description: Failed to update application
 */
router.put("/:id", authorizeRoles("super_admin", "authorization"), updateApplication);

/**
 * @swagger
 * /carepoint/{id}/status:
 *   patch:
 *     summary: Change CarePoint application status
 *     tags: [CarePoint Applications]
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Approved, Rejected, Pending]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Application not found
 *       500:
 *         description: Failed to change status
 */
router.patch("/:id/status", authorizeRoles("super_admin", "authorization"), changeApplicationStatus);

/**
 * @swagger
 * /carepoint/{id}:
 *   delete:
 *     summary: Delete a CarePoint application
 *     tags: [CarePoint Applications]
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
 *         description: Application deleted successfully
 *       404:
 *         description: Application not found
 *       500:
 *         description: Failed to delete application
 */
router.delete("/:id", authorizeRoles("super_admin"), deleteApplication);

export default router;
