// routes/carePointRoute.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createCarePointApplication,
  getCarePointApplications,
  getCarePointApplicationById,
  updateCarePointApplication,
  updateCarePointStatus,
  deleteCarePointApplication,
} from "../controllers/carePointController.js";

const router = express.Router();
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

router.use(authMiddleware);

router.post("/", authorizeRoles("super_admin", "authorization"), createCarePointApplication);
router.get("/", authorizeRoles("super_admin", "authorization", "scheduler", "viewer"), getCarePointApplications);
router.get("/:id", authorizeRoles("super_admin", "authorization", "scheduler", "viewer"), getCarePointApplicationById);
router.put("/:id", authorizeRoles("super_admin", "authorization"), updateCarePointApplication);
router.patch("/:id/status", authorizeRoles("super_admin", "authorization"), updateCarePointStatus);
router.delete("/:id", authorizeRoles("super_admin"), deleteCarePointApplication);

export default router;
