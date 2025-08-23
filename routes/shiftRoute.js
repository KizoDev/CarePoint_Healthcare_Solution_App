import express from "express";
import {
  createShift,
  updateShift,
  deleteShift,
  assignStaffToShift,
  filterShifts,
  getAllShifts,
  getSingleShift
} from "../controllers/shiftController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All shift routes require login
router.use(authMiddleware);

// Public fetch:
router.get("/all", getAllShifts); // All shifts for admin users
router.get("/", filterShifts);   // Filter with query
router.get("/:id", getSingleShift);

// Create / Update / Delete (any admin):
router.post("/", createShift);
router.put("/:id", updateShift);
router.delete("/:id", deleteShift);

// Assign staff (restricted)
router.post(
  "/assign",
  roleMiddleware(["super_admin", "scheduler"]),
  assignStaffToShift
);

export default router;
