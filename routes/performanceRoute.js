// routes/performanceRoute.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../controllers/performanceController.js";

const router = express.Router();
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

router.use(authMiddleware);

router.post("/", authorizeRoles("super_admin", "authorization"), createReview);
router.get("/", authorizeRoles("super_admin", "authorization", "scheduler", "viewer"), getReviews);
router.get("/:id", authorizeRoles("super_admin", "authorization", "scheduler", "viewer"), getReviewById);
router.put("/:id", authorizeRoles("super_admin", "authorization"), updateReview);
router.delete("/:id", authorizeRoles("super_admin"), deleteReview);

export default router;
