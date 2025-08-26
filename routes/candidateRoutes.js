import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
} from "../controllers/candidateControllers.js";

const router = express.Router();

// Public create (candidate portal)
router.post("/", createCandidate);

// Admin reads/updates
router.use(authMiddleware);
router.get("/", roleMiddleware(["super_admin", "authorization"]), getCandidates);
router.get("/:id", roleMiddleware(["super_admin", "authorization"]), getCandidateById);
router.put("/:id", roleMiddleware(["super_admin", "authorization"]), updateCandidate);
router.delete("/:id", roleMiddleware(["super_admin"]), deleteCandidate);

export default router;
