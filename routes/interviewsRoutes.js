import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  scheduleInterview,
  updateInterview,
  cancelInterview,
  getInterviews,
  getInterviewById,
} from "../controllers/interviewsController.js";

const router = express.Router();
router.use(authMiddleware);

// Admin only
router.post("/", roleMiddleware(["super_admin", "authorization"]), scheduleInterview);
router.put("/:id", roleMiddleware(["super_admin", "authorization"]), updateInterview);
router.patch("/:id/cancel", roleMiddleware(["super_admin", "authorization"]), cancelInterview);
router.get("/", roleMiddleware(["super_admin", "authorization"]), getInterviews);
router.get("/:id", roleMiddleware(["super_admin", "authorization"]), getInterviewById);

export default router;
