import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  createJobPosting,
  getJobPostings,
  getJobPostingById,
  updateJobPosting,
  closeJobPosting,
  deleteJobPosting,
} from "../controllers/jobPostingCotrollers.js";

const router = express.Router();

// Public GETs (you can protect if needed)
router.get("/", getJobPostings);
router.get("/:id", getJobPostingById);

// Admin-only modifications
router.use(authMiddleware);
router.post("/", roleMiddleware(["super_admin", "authorization", "scheduler"]), createJobPosting);
router.put("/:id", roleMiddleware(["super_admin", "authorization"]), updateJobPosting);
router.patch("/:id/close", roleMiddleware(["super_admin", "authorization"]), closeJobPosting);
router.delete("/:id", roleMiddleware(["super_admin"]), deleteJobPosting);

export default router;
