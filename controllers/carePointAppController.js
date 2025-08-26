// controllers/carePointController.js
import db from "../models/index.js";
const { CarePointApplication, Staff, AuditLog, Notification } = db;

const logAudit = async (adminId, action, moduleName, details) => {
  try { await AuditLog.create({ admin_id: adminId || null, action, module: moduleName, details }); }
  catch (e) { console.error("AuditLog failed:", e.message); }
};

export const createApplication = async (req, res) => {
  try {
    const payload = req.body; // staff_id, application_type, details (json/text)
    const app = await CarePointApplication.create({ ...payload, submitted_at: new Date() });

    // notify reviewer admins
    const io = req.app.get("io");
    if (io) io.emit("carepoint:newApplication", { applicationId: app.applicationId });

    await Notification.create({ title: "CarePoint Application Submitted", message: "A CarePoint application was submitted", staffId: app.staff_id });
    await logAudit(req.user?.id, "CREATE_CAREPOINT_APP", "CarePointApplication", `App ${app.applicationId} created by ${req.user?.id}`);

    res.status(201).json({ message: "Application created", data: app });
  } catch (err) {
    res.status(500).json({ message: "Failed to create application", error: err.message });
  }
};

export const getApplications = async (req, res) => {
  try {
    const { staffId, status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (staffId) where.staff_id = staffId;
    if (status) where.status = status;
    const offset = (page - 1) * limit;
    const { count, rows } = await CarePointApplication.findAndCountAll({ where, order: [["submitted_at", "DESC"]], limit: parseInt(limit), offset: parseInt(offset) });
    res.json({ total: count, page: parseInt(page), pages: Math.ceil(count / limit), data: rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applications", error: err.message });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const app = await CarePointApplication.findByPk(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch application", error: err.message });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const app = await CarePointApplication.findByPk(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });
    await app.update(req.body);
    await logAudit(req.user?.id, "UPDATE_CAREPOINT_APP", "CarePointApplication", `App ${req.params.id} updated`);
    res.json({ message: "Application updated", data: app });
  } catch (err) {
    res.status(500).json({ message: "Failed to update application", error: err.message });
  }
};

export const changeApplicationStatus = async (req, res) => {
  try {
    const app = await CarePointApplication.findByPk(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });
    const { status } = req.body; // Approved / Rejected / Pending
    app.status = status;
    app.reviewed_at = new Date();
    app.reviewed_by = req.user?.id;
    await app.save();

    await logAudit(req.user?.id, "CHANGE_CAREPOINT_STATUS", "CarePointApplication", `App ${app.applicationId} status ${status}`);

    const io = req.app.get("io");
    if (io) io.to(`user_${app.staff_id}`).emit("carepoint:statusChange", { applicationId: app.applicationId, status });
    await Notification.create({ title: "Application Status Update", message: `Your CarePoint application is ${status}`, staffId: app.staff_id });

    res.json({ message: "Application status updated", data: app });
  } catch (err) {
    res.status(500).json({ message: "Failed to change application status", error: err.message });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const app = await CarePointApplication.findByPk(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });
    await app.destroy();
    await logAudit(req.user?.id, "DELETE_CAREPOINT_APP", "CarePointApplication", `App ${req.params.id} deleted`);
    res.json({ message: "Application deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete application", error: err.message });
  }
};
