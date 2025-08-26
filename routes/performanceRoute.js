// routes/performance.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createReview, getReviews, getReviewById, updateReview, deleteReview,
  createGoal, updateGoal, deleteGoal
} from "../controllers/performanceController.js";

const router = express.Router();
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

router.use(authMiddleware);

// Reviews
router.post("/reviews", authorizeRoles("super_admin", "authorization"), createReview);
router.get("/reviews", authorizeRoles("super_admin", "authorization", "viewer", "scheduler"), getReviews);
router.get("/reviews/:id", authorizeRoles("super_admin", "authorization", "viewer", "scheduler"), getReviewById);
router.put("/reviews/:id", authorizeRoles("super_admin", "authorization"), updateReview);
router.delete("/reviews/:id", authorizeRoles("super_admin"), deleteReview);

// Goals
router.post("/goals", authorizeRoles("super_admin", "authorization"), createGoal);
router.put("/goals/:id", authorizeRoles("super_admin", "authorization"), updateGoal);
router.delete("/goals/:id", authorizeRoles("super_admin"), deleteGoal);

export default router;
