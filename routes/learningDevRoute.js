// routes/learning.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createCourse,
  getCourses,
  enrollStaff,
  getEnrollments,
  markEnrollmentComplete,
  deleteEnrollment
} from "../controllers/learningDevController.js";

const router = express.Router();
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Learning
 *   description: Learning and Development module
 */

/**
 * @swagger
 * /learning/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Learning]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - provider
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               provider:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Course created
 *       500:
 *         description: Failed to create course
 */
router.post("/create", authMiddleware, createCourse);

/**
 * @swagger
 * /learning/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Learning]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of courses
 *       500:
 *         description: Failed to fetch courses
 */
router.get("/courses", authMiddleware, getCourses);

/**
 * @swagger
 * /learning/enroll:
 *   post:
 *     summary: Enroll a staff in a course
 *     tags: [Learning]
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
 *               - courseId
 *             properties:
 *               staffId:
 *                 type: integer
 *               courseId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Staff enrolled
 *       500:
 *         description: Failed to enroll staff
 */
router.post("/enroll",authMiddleware, enrollStaff);

/**
 * @swagger
 * /learning/enroll:
 *   get:
 *     summary: Get all enrollments
 *     tags: [Learning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: integer
 *         description: Filter enrollments by staff ID
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         description: Filter enrollments by course ID
 *     responses:
 *       200:
 *         description: List of enrollments
 *       500:
 *         description: Failed to fetch enrollments
 */
router.get("/enroll",authMiddleware, getEnrollments);

/**
 * @swagger
 * /learning/enroll/{id}/complete:
 *   patch:
 *     summary: Mark enrollment as complete
 *     tags: [Learning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment marked completed
 *       404:
 *         description: Enrollment not found
 *       500:
 *         description: Failed to mark enrollment complete
 */
router.patch("/enroll/:id/complete",authMiddleware, markEnrollmentComplete);

/**
 * @swagger
 * /learning/enroll/{id}:
 *   delete:
 *     summary: Delete enrollment
 *     tags: [Learning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment deleted
 *       404:
 *         description: Enrollment not found
 *       500:
 *         description: Failed to delete enrollment
 */
router.delete("/enroll/:id",authMiddleware, deleteEnrollment);

export default router;
