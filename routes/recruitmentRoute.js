// routes/recruitmentRoute.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  updateCandidateStatus,
  deleteCandidate,
} from "../controllers/recruitmentController.js";

const router = express.Router();
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

router.use(authMiddleware);

router.post("/", authorizeRoles("super_admin", "authorization"), createCandidate);
router.get("/", authorizeRoles("super_admin", "authorization", "scheduler", "viewer"), getCandidates);
router.get("/:id", authorizeRoles("super_admin", "authorization", "scheduler", "viewer"), getCandidateById);
router.put("/:id", authorizeRoles("super_admin", "authorization"), updateCandidate);
router.patch("/:id/status", authorizeRoles("super_admin", "authorization"), updateCandidateStatus);
router.delete("/:id", authorizeRoles("super_admin"), deleteCandidate);

export default router;
