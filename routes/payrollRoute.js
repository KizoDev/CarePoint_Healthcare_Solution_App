// routes/payrollRoute.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createPayroll,
  getPayrolls,
  getPayrollById,
  updatePayroll,
  markPayrollPaid,
  deletePayroll,
} from "../controllers/payrollController.js";

const router = express.Router();

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

router.use(authMiddleware);

// HR/Finance-only actions
router.post("/", authorizeRoles("super_admin", "authorization"), createPayroll);
router.put("/:id", authorizeRoles("super_admin", "authorization"), updatePayroll);
router.patch("/:id/paid", authorizeRoles("super_admin", "authorization"), markPayrollPaid);
router.delete("/:id", authorizeRoles("super_admin"), deletePayroll);

// Read
router.get("/", authorizeRoles("super_admin", "authorization", "scheduler", "viewer"), getPayrolls);
router.get("/:id", authorizeRoles("super_admin", "authorization", "scheduler", "viewer"), getPayrollById);

export default router;
