import db from "../models/index.js";
const { Attendance, LeaveRequest, Staff, AuditLog, Notification } = db;

// ===========================
// Staff check-in (HR only)

export const checkIn = async (req, res) => {
  try {
    const adminId = req.user.id;
    const role = req.user.role;

    if (role !== "HR_admin") {
      return res.status(401).json({ message: "You are not allowed to perform this action" });
    }

    const { staffId } = req.body;
    if (!staffId) {
      return res.status(400).json({ error: "staffId is required" });
    }

    const attendance = await Attendance.create({
      staff_id: staffId,
      date: new Date(),
      status: "present",
      check_in: new Date(),
    });

    await AuditLog.create({
      admin_id: adminId,
      action: "CHECK_IN",
      module: "Attendance",
      details: `HR ${adminId} checked in Staff ${staffId}`,
    });

    res.status(201).json({ message: "Staff checked in successfully", attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===========================
// Staff check-out (HR only)
export const checkOut = async (req, res) => {
  try {
    const adminId = req.user.id;
    const role = req.user.role;

    if (role !== "HR_admin") {
      return res.status(401).json({ message: "You are not allowed to perform this action" });
    }

    const { staffId } = req.body;
    if (!staffId) {
      return res.status(400).json({ error: "staffId is required" });
    }

    const today = new Date().toISOString().split("T")[0];
    const attendance = await Attendance.findOne({
      where: {
        staff_id: staffId,
        date: today,
        check_out: null,
      },
      order: [["check_in", "DESC"]],
    });

    if (!attendance) {
      return res.status(404).json({ error: "No active check-in record found for this staff" });
    }

    attendance.check_out = new Date();
    await attendance.save();

    await AuditLog.create({
      admin_id: adminId,
      action: "CHECK_OUT",
      module: "Attendance",
      details: `HR ${adminId} checked out Staff ${staffId}`,
    });

    res.json({ message: "Staff checked out successfully", attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit leave request (Staff)
export const requestLeave = async (req, res) => {
  try {
      const staffId = req.user.id;
    const { start_date, end_date, reason, type } = req.body;
  

    if (!type) {
      return res.status(400).json({ error: "Leave type is required (sick, vacation, unpaid)" });
    }

    const leave = await LeaveRequest.create({
      staff_id: staffId,
      start_date,
      end_date,
      reason,
      type,
      status: "pending",
    });

    await AuditLog.create({
      admin_id: staffId,
      action: "REQUEST_LEAVE",
      module: "Leave",
      details: `Leave request ${leave.leaveId} created`,
    });

    res.status(201).json({ message: "Leave request submitted", leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve or reject leave (HR only)
export const updateLeaveStatus = async (req, res) => {
  try {
    const role = req.user.role;
    if (role !== "HR_admin") {
      return res.status(401).json({ message: "You are not allowed to perform this action" });
    }

    const { id } = req.params; // 👈 should be leaveId
    const { status } = req.body; // "approved" or "rejected"

    const leave = await LeaveRequest.findByPk(id);
    if (!leave) return res.status(404).json({ error: "Leave request not found" });

    leave.status = status;
    leave.approved_by = req.user.id; // 👈 save the HR who approved/rejected
    await leave.save();

    // Notify staff
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${leave.staff_id}`).emit("leaveUpdate", {
        message: `Your leave request was ${status}`,
      });
    }

    await Notification.create({
      title: "Leave Request Update",
      message: `Your leave request has been ${status}`,
      staffId: leave.staff_id,
    });

    await AuditLog.create({
      admin_id: req.user.id,
      action: "UPDATE_LEAVE",
      module: "Leave",
      details: `Leave ${leave.leaveId} marked ${status}`,
    });

    res.json({ message: `Leave ${status}`, leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
