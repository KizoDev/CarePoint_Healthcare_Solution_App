// controllers/attendanceController.js
import db from "../models/index.js";
const { Attendance, Staff, Shift, AuditLog } = db;

const logAudit = async (req, action, module, details) => {
  try {
    await AuditLog.create({
      admin_id: req.user?.id,
      action,
      module,
      details: details ? JSON.stringify(details) : null,
    });
  } catch (e) {
    console.error("Audit log failed:", e.message);
  }
};

export const createAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body); // { staffId, shiftId?, date, checkInTime, checkOutTime, status }
    await logAudit(req, "create", "Attendance", { attendanceId: attendance.id, staffId: attendance.staffId });

    const io = req.app.get("io");
    if (io) io.to(`user_${attendance.staffId}`).emit("attendanceCreated", attendance);

    res.status(201).json({ message: "Attendance created", data: attendance });
  } catch (err) {
    res.status(500).json({ message: "Failed to create attendance", error: err.message });
  }
};

export const getAttendances = async (req, res) => {
  try {
    const { staffId, startDate, endDate, page = 1, limit = 50 } = req.query;
    const where = {};
    if (staffId) where.staffId = staffId;
    if (startDate && endDate) where.date = { [db.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)] };

    const { count, rows } = await Attendance.findAndCountAll({
      where,
      include: [
        { model: Staff, as: "staff", attributes: ["id", "name", "email"] },
        { model: Shift, as: "shift", required: false },
      ],
      order: [["date", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ total: count, page: parseInt(page), pages: Math.ceil(count / limit), data: rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance", error: err.message });
  }
};

export const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id, {
      include: [
        { model: Staff, as: "staff", attributes: ["id", "name", "email"] },
        { model: Shift, as: "shift", required: false },
      ],
    });
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance", error: err.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });

    await attendance.update(req.body);
    await logAudit(req, "update", "Attendance", { attendanceId: attendance.id });

    res.json({ message: "Attendance updated", data: attendance });
  } catch (err) {
    res.status(500).json({ message: "Failed to update attendance", error: err.message });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });
    await attendance.destroy();

    await logAudit(req, "delete", "Attendance", { attendanceId: req.params.id });

    res.json({ message: "Attendance deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete attendance", error: err.message });
  }
};
