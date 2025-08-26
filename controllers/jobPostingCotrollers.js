import db from "../models/index.js";
const { JobPosting, AuditLog, Notification } = db;

// Create job posting (admin only)
export const createJobPosting = async (req, res) => {
  try {
    const { title, department, description, employment_type, location, salary_range } = req.body;

    const posting = await JobPosting.create({
      title,
      department,
      description,
      employment_type,
      location,
      salary_range,
      status: "open",
      created_by: req.user.id,
    });

    await AuditLog.create({
      admin_id: req.user.id,
      action: "CREATE_JOB_POSTING",
      module: "Recruitment",
      details: `JobPosting ${posting.id} created`,
    });

    // Optional broadcast to admin dashboard
    const io = req.app.get("io");
    if (io) io.emit("recruitment:jobCreated", { posting });

    res.status(201).json({ message: "Job posting created", posting });
  } catch (error) {
    res.status(500).json({ message: "Failed to create job posting", error: error.message });
  }
};

// Get all job postings (public or protected — choose your policy)
export const getJobPostings = async (req, res) => {
  try {
    const { status, department, q } = req.query;
    const where = {};
    if (status) where.status = status;
    if (department) where.department = department;
    if (q) where.title = db.Sequelize.where(db.Sequelize.fn("LOWER", db.Sequelize.col("title")), "LIKE", `%${q.toLowerCase()}%`);

    const postings = await JobPosting.findAll({ where, order: [["created_at", "DESC"]] });
    res.json(postings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job postings", error: error.message });
  }
};

export const getJobPostingById = async (req, res) => {
  try {
    const posting = await JobPosting.findByPk(req.params.id);
    if (!posting) return res.status(404).json({ message: "Job posting not found" });
    res.json(posting);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job posting", error: error.message });
  }
};

// Update job posting (admin)
export const updateJobPosting = async (req, res) => {
  try {
    const posting = await JobPosting.findByPk(req.params.id);
    if (!posting) return res.status(404).json({ message: "Job posting not found" });

    await posting.update(req.body);

    await AuditLog.create({
      admin_id: req.user.id,
      action: "UPDATE_JOB_POSTING",
      module: "Recruitment",
      details: `JobPosting ${posting.id} updated`,
    });

    const io = req.app.get("io");
    if (io) io.emit("recruitment:jobUpdated", { postingId: posting.id });

    res.json({ message: "Job posting updated", posting });
  } catch (error) {
    res.status(500).json({ message: "Failed to update job posting", error: error.message });
  }
};

// Close job posting (admin)
export const closeJobPosting = async (req, res) => {
  try {
    const posting = await JobPosting.findByPk(req.params.id);
    if (!posting) return res.status(404).json({ message: "Job posting not found" });

    posting.status = "closed";
    await posting.save();

    await AuditLog.create({
      admin_id: req.user.id,
      action: "CLOSE_JOB_POSTING",
      module: "Recruitment",
      details: `JobPosting ${posting.id} closed`,
    });

    const io = req.app.get("io");
    if (io) io.emit("recruitment:jobClosed", { postingId: posting.id });

    res.json({ message: "Job posting closed", posting });
  } catch (error) {
    res.status(500).json({ message: "Failed to close job posting", error: error.message });
  }
};

// Delete job posting (admin)
export const deleteJobPosting = async (req, res) => {
  try {
    const posting = await JobPosting.findByPk(req.params.id);
    if (!posting) return res.status(404).json({ message: "Job posting not found" });

    await posting.destroy();

    await AuditLog.create({
      admin_id: req.user.id,
      action: "DELETE_JOB_POSTING",
      module: "Recruitment",
      details: `JobPosting ${req.params.id} deleted`,
    });

    const io = req.app.get("io");
    if (io) io.emit("recruitment:jobDeleted", { postingId: req.params.id });

    res.json({ message: "Job posting deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete job posting", error: error.message });
  }
};
