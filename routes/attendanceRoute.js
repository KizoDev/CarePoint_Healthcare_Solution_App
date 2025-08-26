import express from "express";
import { checkIn, checkOut, requestLeave, updateLeaveStatus } from "../controllers/attendanceController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

// Staff attendance
router.post("/checkin", checkIn);
router.post("/checkout", checkOut);

// Staff leave request
router.post("/leave", requestLeave);

// Admin approves/rejects leave
router.patch("/leave/:id", roleMiddleware("admin", "super_admin"), updateLeaveStatus);

export default router;
