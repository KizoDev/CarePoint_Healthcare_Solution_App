// controllers/carePointController.js
import db from "../models/index.js";
const { CarePointApplication, Staff, AuditLog } = db;

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

export const createCarePointApplication = async (req, res) => {
  try {
    const app = await CarePointApplication.create({
      ...req.body, // { staffId, applicationType, status?, submittedAt?, data? }
      status: req.body.status || "submitted",
      submittedAt: req.body.submittedAt || new Date(),
    });

    await logAudit(req, "create", "CarePointApplication", { applicationId: app.id, staffId: app.staffId });

    const io = req.app.get("io");
    if (io) io.to(`user_${app.staffId}`).emit("carePointSubmitted", app);

    res.status(201).json({ message: "CarePoint application created", data: app });
  } catch (err) {
    res.status(500).json({ message: "Failed to create application", error: err.message });
  }
};

export const getCarePointApplications = async (req, res) => {
  try {
    const { staffId, status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (staffId) where.staffId = staffId;
    if (status) where.status = status;

    const { count, rows } = await CarePointApplication.findAndCountAll({
      where,
      include: [{ model: Staff, as: "staff", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ total: count, page: parseInt(page), pages: Math.ceil(count / limit), data: rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applications", error: err.message });
  }
};

export const getCarePointApplicationById = async (req, res) => {
  try {
    const app = await CarePointApplication.findByPk(req.params.id, {
      include: [{ model: Staff, as: "staff", attributes: ["id", "name", "email"] }],
    });
    if (!app) return res.status(404).json({ message: "Application not found" });
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch application", error: err.message });
  }
};

export const updateCarePointApplication = async (req, res) => {
  try {
    const app = await CarePointApplication.findByPk(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    await app.update(req.body);
    await logAudit(req, "update", "CarePointApplication", { applicationId: app.id });

    res.json({ message: "Application updated", data: app });
  } catch (err) {
    res.status(500).json({ message: "Failed to update application", error: err.message });
  }
};

export const updateCarePointStatus = async (req, res) => {
  try {
    const app = await CarePointApplication.findByPk(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    const { status } = req.body; // draft, submitted, approved, rejected
    app.status = status;
    await app.save();

    await logAudit(req, "status_change", "CarePointApplication", { applicationId: app.id, status });

    const io = req.app.get("io");
    if (io) io.to(`user_${app.staffId}`).emit("carePointStatusChanged", app);

    res.json({ message: "Application status updated", data: app });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status", error: err.message });
  }
};

export const deleteCarePointApplication = async (req, res) => {
  try {
    const app = await CarePointApplication.findByPk(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    await app.destroy();
    await logAudit(req, "delete", "CarePointApplication", { applicationId: req.params.id });

    res.json({ message: "Application deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete application", error: err.message });
  }
};
