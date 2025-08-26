// routes/learning.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createCourse, getCourses, enrollStaff, getEnrollments, markEnrollmentComplete, deleteEnrollment
} from "../controllers/learningDevController.js";

const router = express.Router();
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

router.use(authMiddleware);

router.post("/courses", authorizeRoles("super_admin", "authorization"), createCourse);
router.get("/courses", authorizeRoles("super_admin", "authorization", "viewer", "scheduler"), getCourses);

router.post("/enroll", authorizeRoles("super_admin", "authorization"), enrollStaff);
router.get("/enroll", authorizeRoles("super_admin", "authorization", "viewer"), getEnrollments);
router.patch("/enroll/:id/complete", authorizeRoles("super_admin", "authorization"), markEnrollmentComplete);
router.delete("/enroll/:id", authorizeRoles("super_admin", "authorization"), deleteEnrollment);

export default router;
