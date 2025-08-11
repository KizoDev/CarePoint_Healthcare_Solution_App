import db from "../models/index.js";
import { Op } from "sequelize";
const { Shift, Client, Staff } = db
// Create Shift
export const createShift = async (req, res) => {
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

    res.status(201).json({ message: "Shift created successfully", shift });
  } catch (err) {
    res.status(500).json({ error: "Error creating shift", details: err.message });
  }
};

// Update/Edit Shift
export const updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const shift = await Shift.findByPk(id);
    if (!shift) return res.status(404).json({ error: "Shift not found" });

    await shift.update(req.body);
    res.json({ message: "Shift updated successfully", shift });
  } catch (err) {
    res.status(500).json({ error: "Error updating shift", details: err.message });
  }
};

// Delete Shift
export const deleteShift = async (req, res) => {
  try {
    const { id } = req.params;
    const shift = await Shift.findByPk(id);
    if (!shift) return res.status(404).json({ error: "Shift not found" });

    await shift.destroy();
    res.json({ message: "Shift deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting shift", details: err.message });
  }
};

// Assign Staff to Shift
export const assignStaffToShift = async (req, res) => {
  try {
    const { shiftId, staffId } = req.body;
    const shift = await Shift.findByPk(shiftId);
    if (!shift) return res.status(404).json({ error: "Shift not found" });

    shift.staffId = staffId;
    shift.status = "assigned";
    await shift.save();

    res.json({ message: "Staff assigned successfully", shift });
  } catch (err) {
    res.status(500).json({ error: "Error assigning staff", details: err.message });
  }
};

// Filter Shifts
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
