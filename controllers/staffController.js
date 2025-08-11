import db from "../models/index.js";
const  { Staff, StaffDocument, Shift } = db
// Create a new staff
export const createStaff = async (req, res) => {
  try {
    const newStaff = await Staff.create(req.body);
    res.status(201).json({ message: "Staff created successfully", data: newStaff });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all staff with pagination, filters
export const getAllStaff = async (req, res) => {
  try {
    const { role, is_available, page = 1, limit = 10 } = req.query;

    const where = {};
    if (role) where.role = role;
    if (is_available !== undefined) where.is_available = is_available === 'true';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Staff.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single staff profile by ID
export const getSingleStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id, {
      include: [{ model: StaffDocument, as: "documents" }],
    });
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update staff profile
export const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    await staff.update(req.body);
    res.status(200).json({ message: "Staff updated successfully", data: staff });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete staff
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    await staff.destroy();
    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get staff shift history
export const getStaffShiftHistory = async (req, res) => {
  try {
    const shifts = await Shift.findAll({
      where: { staff_id: req.params.id },
      order: [['start_time', 'DESC']],
    });

    res.status(200).json(shifts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle mobile app access for a staff
export const toggleMobileAccess = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    const access = staff.Can_access_mobile_app?.[0]?.Access ?? true;

    staff.Can_access_mobile_app = [
      {
        label: "Access_mobile_App",
        Access: !access,
      },
    ];

    await staff.save();
    res.status(200).json({
      message: `Mobile access ${!access ? "enabled" : "disabled"} successfully`,
      access: !access,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
