import express from "express";
import {
  createStaff,
  getAllStaff,
  getSingleStaff,
  updateStaff,
  deleteStaff,
  getStaffShiftHistory,
  toggleMobileAccess,
} from "../controllers/staffController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import {roleMiddleware} from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes below require authentication
router.use(authMiddleware);

// ✅ Only super_admin and scheduler can manage staff
router.post("/", roleMiddleware(["super_admin", "scheduler"]), createStaff);
router.get("/", roleMiddleware(["super_admin", "scheduler", "authorization", "viewer"]), getAllStaff);
router.get("/:id", roleMiddleware(["super_admin", "scheduler", "authorization", "viewer"]), getSingleStaff);
router.put("/:id", roleMiddleware(["super_admin", "scheduler"]), updateStaff);
router.delete("/:id", roleMiddleware(["super_admin"]), deleteStaff);

// ✅ View staff shift history (authorized roles)
router.get("/:id/shift-history", roleMiddleware(["super_admin", "scheduler", "authorization", "viewer"]), getStaffShiftHistory);

// ✅ Toggle mobile access (super_admin or authorization role)
router.patch("/:id/toggle-mobile-access", roleMiddleware(["super_admin", "authorization"]), toggleMobileAccess);

export default router;
