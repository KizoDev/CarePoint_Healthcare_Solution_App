// controllers/benefitController.js
import db from "../models/index.js";
const { Benefit, Staff, AuditLog } = db;

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

export const createBenefit = async (req, res) => {
  try {
    const benefit = await Benefit.create(req.body); // { staffId, type, provider, startDate, endDate, status, coverageDetails }
    await logAudit(req, "create", "Benefits", { benefitId: benefit.id, staffId: benefit.staffId });

    const io = req.app.get("io");
    if (io) io.to(`user_${benefit.staffId}`).emit("benefitAssigned", benefit);

    res.status(201).json({ message: "Benefit created", data: benefit });
  } catch (err) {
    res.status(500).json({ message: "Failed to create benefit", error: err.message });
  }
};

export const getBenefits = async (req, res) => {
  try {
    const { staffId, status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (staffId) where.staffId = staffId;
    if (status) where.status = status;

    const { count, rows } = await Benefit.findAndCountAll({
      where,
      include: [{ model: Staff, as: "staff", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ total: count, page: parseInt(page), pages: Math.ceil(count / limit), data: rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch benefits", error: err.message });
  }
};

export const getBenefitById = async (req, res) => {
  try {
    const benefit = await Benefit.findByPk(req.params.id, {
      include: [{ model: Staff, as: "staff", attributes: ["id", "name", "email"] }],
    });
    if (!benefit) return res.status(404).json({ message: "Benefit not found" });
    res.json(benefit);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch benefit", error: err.message });
  }
};

export const updateBenefit = async (req, res) => {
  try {
    const benefit = await Benefit.findByPk(req.params.id);
    if (!benefit) return res.status(404).json({ message: "Benefit not found" });

    await benefit.update(req.body);
    await logAudit(req, "update", "Benefits", { benefitId: benefit.id });

    res.json({ message: "Benefit updated", data: benefit });
  } catch (err) {
    res.status(500).json({ message: "Failed to update benefit", error: err.message });
  }
};

export const deleteBenefit = async (req, res) => {
  try {
    const benefit = await Benefit.findByPk(req.params.id);
    if (!benefit) return res.status(404).json({ message: "Benefit not found" });

    await benefit.destroy();
    await logAudit(req, "delete", "Benefits", { benefitId: req.params.id });

    res.json({ message: "Benefit deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete benefit", error: err.message });
  }
};
