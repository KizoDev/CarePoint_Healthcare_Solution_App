// controllers/shiftController.js
import db from "../models/index.js";
import { Op } from "sequelize";

const { Shift, Client, Staff, AuditLog, Notification } = db;

//  Create Shift
export const createShift = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { clientId, staffId, start_time, end_time, status } = req.body;
    const created_by = req.user.id;

    const shift = await Shift.create({
      clientId,
      staffId,
      start_time,
      end_time,
      status,
      created_by,
    });

    // 🔔 Notify assigned staff
    if (staffId) {
      const io = req.app.get("io");
      await Notification.create({
        title: "New Shift Assigned",
        message: `You have a new shift from ${start_time} to ${end_time}`,
        type: "shift",
        recipientId: staffId,
        recipientType: "staff",
      });
      if (io) {
        io.to(`user_${staffId}`).emit("newShift", {
          message: "You have a new shift assigned",
          shift,
        });
      }
    }

    // 🧾 Audit Log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "CREATE_SHIFT",
      module: "Shift Management",
      details: `HR_admin created a shift for client ${clientId} and staff ${staffId}`,
      timestamp: new Date(),
    });

    res.status(201).json({ message: "Shift created successfully", shift });
  } catch (err) {
    res.status(500).json({ error: "Error creating shift", details: err.message });
  }
};

// ✅ Get all shifts
export const getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.findAll({
      include: [
        { model: Client, as: "client" },
        { model: Staff, as: "staff" },
      ],
      order: [["start_time", "DESC"]],
    });
    res.status(200).json(shifts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shifts", error });
  }
};

// ✅ Get single shift
export const getSingleShift = async (req, res) => {
  try {
    const shift = await Shift.findByPk(req.params.id, {
      include: [
        { model: Client, as: "client" },
        { model: Staff, as: "staff" },
      ],
    });
    if (!shift) return res.status(404).json({ message: "Shift not found" });
    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shift", error });
  }
};

// ✅ Update Shift
export const updateShift = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const shift = await Shift.findByPk(req.params.id);
    if (!shift) return res.status(404).json({ error: "Shift not found" });

    await shift.update(req.body);

    // 🔔 Notify staff
    const io = req.app.get("io");
    if (shift.staffId) {
      await Notification.create({
        title: "Shift Updated",
        message: "Your shift details have been updated",
        type: "shift",
        recipientId: shift.staffId,
        recipientType: "staff",
      });
      if (io) {
        io.to(`user_${shift.staffId}`).emit("shiftUpdated", {
          message: "Your shift has been updated",
          shift,
        });
      }
    }

    // 🧾 Audit Log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "UPDATE_SHIFT",
      module: "Shift Management",
      details: `HR_admin updated shift ${shift.id}`,
      timestamp: new Date(),
    });

    res.json({ message: "Shift updated successfully", shift });
  } catch (err) {
    res.status(500).json({ error: "Error updating shift", details: err.message });
  }
};

// ✅ Delete Shift
export const deleteShift = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const shift = await Shift.findByPk(req.params.id);
    if (!shift) return res.status(404).json({ error: "Shift not found" });

    const staffId = shift.staffId;
    await shift.destroy();

    // 🔔 Notify staff
    const io = req.app.get("io");
    if (staffId) {
      await Notification.create({
        title: "Shift Cancelled",
        message: "A shift assigned to you was cancelled",
        type: "shift",
        recipientId: staffId,
        recipientType: "staff",
      });
      if (io) {
        io.to(`user_${staffId}`).emit("shiftDeleted", {
          message: "Your shift has been cancelled",
          shiftId: req.params.id,
        });
      }
    }

    // 🧾 Audit Log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "DELETE_SHIFT",
      module: "Shift Management",
      details: `HR_admin deleted shift ${req.params.id}`,
      timestamp: new Date(),
    });

    res.json({ message: "Shift deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting shift", details: err.message });
  }
};

// ✅ Assign staff to shift
export const assignStaffToShift = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { shiftId, staffId } = req.body;
    const shift = await Shift.findByPk(shiftId);
    if (!shift) return res.status(404).json({ error: "Shift not found" });

    shift.staffId = staffId;
    shift.status = "assigned";
    await shift.save();

    await Notification.create({
      title: "Shift Assigned",
      message: "You have been assigned a new shift",
      type: "shift",
      recipientId: staffId,
      recipientType: "staff",
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`user_${staffId}`).emit("shiftAssigned", {
        message: "You have been assigned a shift",
        shift,
      });
    }

    // 🧾 Audit Log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "ASSIGN_SHIFT",
      module: "Shift Management",
      details: `HR_admin assigned shift ${shiftId} to staff ${staffId}`,
      timestamp: new Date(),
    });

    res.json({ message: "Staff assigned successfully", shift });
  } catch (err) {
    res.status(500).json({ error: "Error assigning staff", details: err.message });
  }
};

// ✅ Filter shifts by query
export const filterShifts = async (req, res) => {
  try {
    const { start_date, end_date, status, staffId, clientId } = req.query;
    const where = {};

    if (status) where.status = status;
    if (staffId) where.staff_id = staffId;
    if (clientId) where.client_id = clientId;
    if (start_date && end_date) {
      where.start_time = { [Op.between]: [new Date(start_date), new Date(end_date)] };
    }

    const shifts = await Shift.findAll({
      where,
      include: [
        { model: Client, as: "client" },
        { model: Staff, as: "staff" },
      ],
      order: [["start_time", "ASC"]],
    });

    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: "Error filtering shifts", details: err.message });
  }
};

// ✅ Get staff shift history
export const getStaffShiftHistory = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const shifts = await Shift.findAll({
      where: { staff_id: req.params.id },
      order: [["start_time", "DESC"]],
    });

    res.status(200).json(shifts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
