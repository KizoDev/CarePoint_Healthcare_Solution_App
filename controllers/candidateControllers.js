import db from "../models/index.js";
const { Candidate, AuditLog } = db;

// Public: create candidate profile (candidate portal or open form)
export const createCandidate = async (req, res) => {
  try {
    const { full_name, email, phone, resume_url, skills } = req.body;
    const candidate = await Candidate.create({ full_name, email, phone, resume_url, skills });

    // No admin user context here; optional audit not needed. If authenticated admin creates, log it.
    if (req.user?.id) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: "CREATE_CANDIDATE",
        module: "Recruitment",
        details: `Candidate ${candidate.id} created by admin`,
      });
    }

    res.status(201).json({ message: "Candidate created", candidate });
  } catch (error) {
    res.status(500).json({ message: "Failed to create candidate", error: error.message });
  }
};

// Admin: list candidates
export const getCandidates = async (req, res) => {
  try {
    const { q } = req.query;
    const where = {};
    if (q) where.full_name = db.Sequelize.where(db.Sequelize.fn("LOWER", db.Sequelize.col("full_name")), "LIKE", `%${q.toLowerCase()}%`);

    const candidates = await Candidate.findAll({ where, order: [["created_at", "DESC"]] });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch candidates", error: error.message });
  }
};

export const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch candidate", error: error.message });
  }
};

export const updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    await candidate.update(req.body);

    // Optional audit if admin updated
    if (req.user?.id) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: "UPDATE_CANDIDATE",
        module: "Recruitment",
        details: `Candidate ${candidate.id} updated`,
      });
    }

    res.json({ message: "Candidate updated", candidate });
  } catch (error) {
    res.status(500).json({ message: "Failed to update candidate", error: error.message });
  }
};

export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    await candidate.destroy();

    if (req.user?.id) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: "DELETE_CANDIDATE",
        module: "Recruitment",
        details: `Candidate ${req.params.id} deleted`,
      });
    }

    res.json({ message: "Candidate deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete candidate", error: error.message });
  }
};
