import db from "../models/index.js";
const { JobPosting, AuditLog, Notification } = db;

// Create Job Posting — HR_admin only
export const createJobPosting = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

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

    // ✅ Audit log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "CREATE_JOB_POSTING",
      module: "Recruitment",
      details: `HR_admin created job posting: ${posting.title} (${posting.id})`,
      timestamp: new Date(),
    });

    // ✅ Notify all admins or recruiters (optional broadcast)
    const io = req.app.get("io");
    if (io) io.emit("recruitment:jobCreated", { message: `New job posted: ${posting.title}` });

    res.status(201).json({ message: "Job posting created successfully", posting });
  } catch (error) {
    console.error("Error creating job posting:", error);
    res.status(500).json({ message: "Failed to create job posting", error: error.message });
  }
};

// Get All Job Postings (public or restricted based on policy)
export const getJobPostings = async (req, res) => {
  try {
    const { status, department, q } = req.query;
    const where = {};
    if (status) where.status = status;
    if (department) where.department = department;
    if (q)
      where.title = db.Sequelize.where(
        db.Sequelize.fn("LOWER", db.Sequelize.col("title")),
        "LIKE",
        `%${q.toLowerCase()}%`
      );

    const postings = await JobPosting.findAll({ where, order: [["created_at", "DESC"]] });
    res.json(postings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job postings", error: error.message });
  }
};

// Get Single Job Posting (public or HR)
export const getJobPostingById = async (req, res) => {
  try {
    const posting = await JobPosting.findByPk(req.params.id);
    if (!posting) return res.status(404).json({ message: "Job posting not found" });
    res.json(posting);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job posting", error: error.message });
  }
};

// Update Job Posting — HR_admin only
export const updateJobPosting = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const posting = await JobPosting.findByPk(req.params.id);
    if (!posting) return res.status(404).json({ message: "Job posting not found" });

    await posting.update(req.body);

    await AuditLog.create({
      admin_id: req.user.id,
      action: "UPDATE_JOB_POSTING",
      module: "Recruitment",
      details: `HR_admin updated job posting: ${posting.title} (${posting.id})`,
      timestamp: new Date(),
    });

    const io = req.app.get("io");
    if (io) io.emit("recruitment:jobUpdated", { message: `Job updated: ${posting.title}` });

    await Notification.create({
      title: "Job Posting Updated",
      message: `The job "${posting.title}" has been updated.`,
      type: "recruitment",
    });

    res.json({ message: "Job posting updated successfully", posting });
  } catch (error) {
    res.status(500).json({ message: "Failed to update job posting", error: error.message });
  }
};

// Close Job Posting — HR_admin only
export const closeJobPosting = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const posting = await JobPosting.findByPk(req.params.id);
    if (!posting) return res.status(404).json({ message: "Job posting not found" });

    posting.status = "closed";
    await posting.save();

    await AuditLog.create({
      admin_id: req.user.id,
      action: "CLOSE_JOB_POSTING",
      module: "Recruitment",
      details: `HR_admin closed job posting: ${posting.title} (${posting.id})`,
      timestamp: new Date(),
    });

    const io = req.app.get("io");
    if (io) io.emit("recruitment:jobClosed", { message: `Job closed: ${posting.title}` });

    await Notification.create({
      title: "Job Posting Closed",
      message: `The job "${posting.title}" has been closed.`,
      type: "recruitment",
    });

    res.json({ message: "Job posting closed successfully", posting });
  } catch (error) {
    res.status(500).json({ message: "Failed to close job posting", error: error.message });
  }
};

// Delete Job Posting — HR_admin only
export const deleteJobPosting = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const posting = await JobPosting.findByPk(req.params.id);
    if (!posting) return res.status(404).json({ message: "Job posting not found" });

    await posting.destroy();

    await AuditLog.create({
      admin_id: req.user.id,
      action: "DELETE_JOB_POSTING",
      module: "Recruitment",
      details: `HR_admin deleted job posting: ${posting.title} (${req.params.id})`,
      timestamp: new Date(),
    });

    const io = req.app.get("io");
    if (io) io.emit("recruitment:jobDeleted", { message: `Job deleted: ${posting.title}` });

    await Notification.create({
      title: "Job Posting Deleted",
      message: `The job "${posting.title}" has been deleted.`,
      type: "recruitment",
    });

    res.json({ message: "Job posting deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete job posting", error: error.message });
  }
};
