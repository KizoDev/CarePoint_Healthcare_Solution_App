// routes/benefits.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createBenefitPlan,
  getBenefitPlans,
  assignStaffBenefit,
  getStaffBenefits,
  removeStaffBenefit,
} from "../controllers/benefitController.js";

const router = express.Router();
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

router.use(authMiddleware);

router.post("/plans", authorizeRoles("super_admin", "authorization"), createBenefitPlan);
router.get("/plans", authorizeRoles("super_admin", "authorization", "viewer"), getBenefitPlans);

router.post("/assign", authorizeRoles("super_admin", "authorization"), assignStaffBenefit);
router.get("/staff", authorizeRoles("super_admin", "authorization", "viewer"), getStaffBenefits);
router.delete("/assign/:id", authorizeRoles("super_admin", "authorization"), removeStaffBenefit);

export default router;
