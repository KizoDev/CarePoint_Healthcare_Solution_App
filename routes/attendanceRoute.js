// routes/attendanceRoute.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createAttendance,
  getAttendances,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

router.use(authMiddleware);

router.post("/", authorizeRoles("super_admin", "scheduler"), createAttendance);
router.get("/", authorizeRoles("super_admin", "scheduler", "authorization", "viewer"), getAttendances);
router.get("/:id", authorizeRoles("super_admin", "scheduler", "authorization", "viewer"), getAttendanceById);
router.put("/:id", authorizeRoles("super_admin", "scheduler"), updateAttendance);
router.delete("/:id", authorizeRoles("super_admin"), deleteAttendance);

export default router;
