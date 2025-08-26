// routes/payroll.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createPayrollRun,
  getPayrollRuns,
  getPayrollRunById,
  updatePayrollRun,
  getPayslips,
  getPayslipById,
  updatePayslip,
  markPayslipPaid,
} from "../controllers/payrollController.js";

const router = express.Router();
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

router.use(authMiddleware);

// Payroll run management (HR/finance)
router.post("/runs", authorizeRoles("super_admin", "authorization"), createPayrollRun);
router.get("/runs", authorizeRoles("super_admin", "authorization", "viewer"), getPayrollRuns);
router.get("/runs/:id", authorizeRoles("super_admin", "authorization", "viewer"), getPayrollRunById);
router.put("/runs/:id", authorizeRoles("super_admin", "authorization"), updatePayrollRun);

// Payslip
router.get("/payslips", authorizeRoles("super_admin", "authorization", "viewer"), getPayslips);
router.get("/payslips/:id", authorizeRoles("super_admin", "authorization", "viewer"), getPayslipById);
router.put("/payslips/:id", authorizeRoles("super_admin", "authorization"), updatePayslip);
router.patch("/payslips/:id/paid", authorizeRoles("super_admin", "authorization"), markPayslipPaid);

export default router;
