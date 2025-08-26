import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  applyToJob,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
} from "../controllers/jobApplicationController.js";

const router = express.Router();

// Public apply + withdraw
router.post("/", applyToJob);
router.patch("/:id/withdraw", withdrawApplication);

// Admin views & status updates
router.use(authMiddleware);
router.get("/", roleMiddleware(["super_admin", "authorization"]), getApplications);
router.get("/:id", roleMiddleware(["super_admin", "authorization"]), getApplicationById);
router.patch("/:id/status", roleMiddleware(["super_admin", "authorization"]), updateApplicationStatus);

export default router;
