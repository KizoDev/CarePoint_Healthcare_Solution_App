// routes/carePointRoute.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  changeApplicationStatus,
  deleteApplication,
} from "../controllers/carePointAppController.js";

const router = express.Router();
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

router.use(authMiddleware);

router.post("/", authorizeRoles("super_admin", "authorization"), createApplication);
router.get("/", authorizeRoles("super_admin", "authorization", "scheduler", "viewer"), getApplications);
router.get("/:id", authorizeRoles("super_admin", "authorization", "scheduler", "viewer"), getApplicationById);
router.put("/:id", authorizeRoles("super_admin", "authorization"), updateApplication);
router.patch("/:id/status", authorizeRoles("super_admin", "authorization"), changeApplicationStatus);
router.delete("/:id", authorizeRoles("super_admin"), deleteApplication);

export default router;
