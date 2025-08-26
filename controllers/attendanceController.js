import db from "../models/index.js";
const { Attendance, LeaveRequest, Staff, AuditLog, Notification } = db;

// Staff check-in
export const checkIn = async (req, res) => {
  try {
    const staffId = req.user.id;
    const attendance = await Attendance.create({ staff_id: staffId, check_in: new Date() });

    await AuditLog.create({ admin_id: staffId, action: "CHECK_IN", module: "Attendance", details: `Staff ${staffId} checked in` });
    res.status(201).json({ message: "Checked in successfully", attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Staff check-out
export const checkOut = async (req, res) => {
  try {
    const staffId = req.user.id;
    const attendance = await Attendance.findOne({ where: { staff_id: staffId }, order: [["check_in", "DESC"]] });

    if (!attendance) return res.status(404).json({ error: "No check-in record found" });

    attendance.check_out = new Date();
    await attendance.save();

    await AuditLog.create({ admin_id: staffId, action: "CHECK_OUT", module: "Attendance", details: `Staff ${staffId} checked out` });
    res.json({ message: "Checked out successfully", attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit leave request
export const requestLeave = async (req, res) => {
  try {
    const { start_date, end_date, reason } = req.body;
    const staffId = req.user.id;

    const leave = await LeaveRequest.create({ staff_id: staffId, start_date, end_date, reason, status: "pending" });

    await AuditLog.create({ admin_id: staffId, action: "REQUEST_LEAVE", module: "Leave", details: `Leave request ${leave.id}` });
    res.status(201).json({ message: "Leave request submitted", leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve or reject leave
export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approved" or "rejected"
    const leave = await LeaveRequest.findByPk(id);

    if (!leave) return res.status(404).json({ error: "Leave request not found" });

    leave.status = status;
    await leave.save();

    // Notify staff
    const io = req.app.get("io");
    if (io) io.to(`user_${leave.staff_id}`).emit("leaveUpdate", { message: `Your leave request was ${status}` });
    await Notification.create({ title: "Leave Request Update", message: `Your leave request has been ${status}`, staffId: leave.staff_id });

    await AuditLog.create({ admin_id: req.user.id, action: "UPDATE_LEAVE", module: "Leave", details: `Leave ${id} marked ${status}` });
    res.json({ message: `Leave ${status}`, leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
