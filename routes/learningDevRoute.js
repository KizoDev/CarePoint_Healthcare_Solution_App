// routes/learningRoute.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createTraining,
  getTrainings,
  getTrainingById,
  updateTraining,
  markTrainingCompleted,
  deleteTraining,
} from "../controllers/learningController.js";

const router = express.Router();
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

router.use(authMiddleware);

router.post("/", authorizeRoles("super_admin", "authorization"), createTraining);
router.get("/", authorizeRoles("super_admin", "authorization", "scheduler", "viewer"), getTrainings);
router.get("/:id", authorizeRoles("super_admin", "authorization", "scheduler", "viewer"), getTrainingById);
router.put("/:id", authorizeRoles("super_admin", "authorization"), updateTraining);
router.patch("/:id/completed", authorizeRoles("super_admin", "authorization"), markTrainingCompleted);
router.delete("/:id", authorizeRoles("super_admin"), deleteTraining);

export default router;
