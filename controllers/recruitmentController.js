// controllers/recruitmentController.js
import db from "../models/index.js";
const { Recruitment, Admin, AuditLog } = db;

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

export const createCandidate = async (req, res) => {
  try {
    const candidate = await Recruitment.create({
      ...req.body, // { candidateName, email, phone, position, resumeUrl, status }
      createdBy: req.user.id,
    });

    await logAudit(req, "create", "Recruitment", { candidateId: candidate.id, position: candidate.position });
    res.status(201).json({ message: "Candidate created", data: candidate });
  } catch (err) {
    res.status(500).json({ message: "Failed to create candidate", error: err.message });
  }
};

export const getCandidates = async (req, res) => {
  try {
    const { status, position, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (position) where.position = position;

    const { count, rows } = await Recruitment.findAndCountAll({
      where,
      include: [{ model: Admin, as: "creator", attributes: ["id", "email", "role"] }],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ total: count, page: parseInt(page), pages: Math.ceil(count / limit), data: rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch candidates", error: err.message });
  }
};

export const getCandidateById = async (req, res) => {
  try {
    const candidate = await Recruitment.findByPk(req.params.id, {
      include: [{ model: Admin, as: "creator", attributes: ["id", "email", "role"] }],
    });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch candidate", error: err.message });
  }
};

export const updateCandidate = async (req, res) => {
  try {
    const candidate = await Recruitment.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    await candidate.update(req.body);
    await logAudit(req, "update", "Recruitment", { candidateId: candidate.id });

    res.json({ message: "Candidate updated", data: candidate });
  } catch (err) {
    res.status(500).json({ message: "Failed to update candidate", error: err.message });
  }
};

export const updateCandidateStatus = async (req, res) => {
  try {
    const candidate = await Recruitment.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    const { status } = req.body; // applied, screening, interviewing, offered, hired, rejected
    candidate.status = status;
    await candidate.save();

    await logAudit(req, "status_change", "Recruitment", { candidateId: candidate.id, status });

    res.json({ message: "Candidate status updated", data: candidate });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status", error: err.message });
  }
};

export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Recruitment.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    await candidate.destroy();
    await logAudit(req, "delete", "Recruitment", { candidateId: req.params.id });

    res.json({ message: "Candidate deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete candidate", error: err.message });
  }
};
