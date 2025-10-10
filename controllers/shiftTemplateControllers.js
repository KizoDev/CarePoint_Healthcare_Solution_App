import db from "../models/index.js";
const { ShiftTemplate, AuditLog } = db;

// Create a new shift template
export const createShiftTemplate = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { clientId, name, start_time, end_time,day_of_week,  recurrence, status,  } = req.body;

    const template = await ShiftTemplate.create({
      clientId,
      name,
      start_time,
      end_time,
      day_of_week,
      recurrence,
      status,
    });

    // 🧾 Audit Log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "CREATE_SHIFT_TEMPLATE",
      module: "Shift Template",
      details: `HR_admin created a shift template: ${name}`,
      timestamp: new Date(),
    });

    res.status(201).json({ message: "Shift template created successfully", data: template });
  } catch (error) {
    res.status(500).json({ message: "Error creating shift template", error: error.message });
  }
};

// Get all shift templates
export const getAllTemplates = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const templates = await ShiftTemplate.findAll({ include: ["client"] })

    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching templates", error: error.message });
  }
};

// Delete shift template
export const deleteTemplate = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { id } = req.params;
    const deleted = await ShiftTemplate.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: "Template not found" });
    }

    // 🧾 Audit Log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "DELETE_SHIFT_TEMPLATE",
      module: "Shift Template",
      details: `HR_admin deleted shift template with ID: ${id}`,
      timestamp: new Date(),
    });

    res.json({ message: "Shift template deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting template", error: error.message });
  }
};
