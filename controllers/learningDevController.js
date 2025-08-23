// controllers/learningController.js
import db from "../models/index.js";
const { LearningDevelopment, Staff, AuditLog } = db;

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

export const createTraining = async (req, res) => {
  try {
    const training = await LearningDevelopment.create(req.body); // { staffId, courseName, provider, startDate, endDate, status, certificateUrl }
    await logAudit(req, "create", "LearningDevelopment", { trainingId: training.id, staffId: training.staffId });

    const io = req.app.get("io");
    if (io) io.to(`user_${training.staffId}`).emit("trainingAssigned", training);

    res.status(201).json({ message: "Training created", data: training });
  } catch (err) {
    res.status(500).json({ message: "Failed to create training", error: err.message });
  }
};

export const getTrainings = async (req, res) => {
  try {
    const { staffId, status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (staffId) where.staffId = staffId;
    if (status) where.status = status;

    const { count, rows } = await LearningDevelopment.findAndCountAll({
      where,
      include: [{ model: Staff, as: "staff", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ total: count, page: parseInt(page), pages: Math.ceil(count / limit), data: rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch trainings", error: err.message });
  }
};

export const getTrainingById = async (req, res) => {
  try {
    const training = await LearningDevelopment.findByPk(req.params.id, {
      include: [{ model: Staff, as: "staff", attributes: ["id", "name", "email"] }],
    });
    if (!training) return res.status(404).json({ message: "Training not found" });
    res.json(training);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch training", error: err.message });
  }
};

export const updateTraining = async (req, res) => {
  try {
    const training = await LearningDevelopment.findByPk(req.params.id);
    if (!training) return res.status(404).json({ message: "Training not found" });

    await training.update(req.body);
    await logAudit(req, "update", "LearningDevelopment", { trainingId: training.id });

    res.json({ message: "Training updated", data: training });
  } catch (err) {
    res.status(500).json({ message: "Failed to update training", error: err.message });
  }
};

export const markTrainingCompleted = async (req, res) => {
  try {
    const training = await LearningDevelopment.findByPk(req.params.id);
    if (!training) return res.status(404).json({ message: "Training not found" });

    training.status = "completed";
    await training.save();

    await logAudit(req, "status_change", "LearningDevelopment", { trainingId: training.id, status: "completed" });

    const io = req.app.get("io");
    if (io) io.to(`user_${training.staffId}`).emit("trainingCompleted", training);

    res.json({ message: "Training marked as completed", data: training });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark completed", error: err.message });
  }
};

export const deleteTraining = async (req, res) => {
  try {
    const training = await LearningDevelopment.findByPk(req.params.id);
    if (!training) return res.status(404).json({ message: "Training not found" });

    await training.destroy();
    await logAudit(req, "delete", "LearningDevelopment", { trainingId: req.params.id });

    res.json({ message: "Training deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete training", error: err.message });
  }
};

