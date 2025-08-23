// routes/benefitRoute.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createBenefit,
  getBenefits,
  getBenefitById,
  updateBenefit,
  deleteBenefit,
} from "../controllers/benefitController.js";

const router = express.Router();
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

router.use(authMiddleware);

router.post("/", authorizeRoles("super_admin", "authorization"), createBenefit);
router.get("/", authorizeRoles("super_admin", "authorization", "scheduler", "viewer"), getBenefits);
router.get("/:id", authorizeRoles("super_admin", "authorization", "scheduler", "viewer"), getBenefitById);
router.put("/:id", authorizeRoles("super_admin", "authorization"), updateBenefit);
router.delete("/:id", authorizeRoles("super_admin"), deleteBenefit);

export default router;
