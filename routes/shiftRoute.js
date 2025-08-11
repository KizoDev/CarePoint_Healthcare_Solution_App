import express from "express";
import {
  createShift,
  updateShift,
  deleteShift,
  assignStaffToShift,
  filterShifts
} from "../controllers/shiftController.js";

import  authMiddleware  from "../middleware/authMiddleware.js";
import  {roleMiddleware}  from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes below require authentication
router.use(authMiddleware);

// All authenticated admins can view and filter shifts
router.get("/", filterShifts);
router.post("/", createShift);
router.put("/:id", updateShift);
router.delete("/:id", deleteShift);

// Only super_admin and scheduler can assign staff
router.post(
  "/assign",
  roleMiddleware("super_admin", "scheduler"),
  assignStaffToShift
);

export default router;
