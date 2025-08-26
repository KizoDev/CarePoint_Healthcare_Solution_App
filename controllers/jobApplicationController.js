import db from "../models/index.js";
const { Application, JobPosting, Candidate, AuditLog, Notification, Staff } = db;

// Public: apply to a job
export const applyToJob = async (req, res) => {
  try {
    const { job_posting_id, candidate_id, cover_letter } = req.body;

    // Validate posting & candidate
    const posting = await JobPosting.findByPk(job_posting_id);
    if (!posting || posting.status !== "open") {
      return res.status(400).json({ message: "Invalid or closed job posting" });
    }
    const candidate = await Candidate.findByPk(candidate_id);
    if (!candidate) return res.status(400).json({ message: "Invalid candidate" });

    const application = await Application.create({
      job_posting_id,
      candidate_id,
      cover_letter,
      status: "received",
    });

    // Audit (system)
    await AuditLog.create({
      admin_id: req.user?.id || null,
      action: "CREATE_APPLICATION",
      module: "Recruitment",
      details: `Application ${application.id} created for posting ${job_posting_id}`,
    });

    // Notify admins (broadcast to dashboard)
    const io = req.app.get("io");
    if (io) io.emit("recruitment:newApplication", { applicationId: application.id, job_posting_id });

    // Optional: create a notification row (general)
    await Notification.create({
      title: "New Job Application",
      message: `New application for ${posting.title}`,
      type: "general",
      staffId: null,
    });

    res.status(201).json({ message: "Application submitted", application });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit application", error: error.message });
  }
};

// Admin: list applications
export const getApplications = async (req, res) => {
  try {
    const { status, job_posting_id, candidate_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (job_posting_id) where.job_posting_id = job_posting_id;
    if (candidate_id) where.candidate_id = candidate_id;

    const apps = await Application.findAll({
      where,
      include: [
        { model: JobPosting, as: "job_posting" },
        { model: Candidate, as: "candidate" },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applications", error: error.message });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const app = await Application.findByPk(req.params.id, {
      include: [
        { model: JobPosting, as: "job_posting" },
        { model: Candidate, as: "candidate" },
      ],
    });
    if (!app) return res.status(404).json({ message: "Application not found" });
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch application", error: error.message });
  }
};

// Admin: update status (shortlisted/interviewed/offered/rejected/hired)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const app = await Application.findByPk(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    app.status = status;
    await app.save();

    await AuditLog.create({
      admin_id: req.user.id,
      action: "UPDATE_APPLICATION_STATUS",
      module: "Recruitment",
      details: `Application ${app.id} -> ${status}`,
    });

    // Notify dashboards (admins)
    const io = req.app.get("io");
    if (io) io.emit("recruitment:applicationUpdated", { applicationId: app.id, status });

    // Note: If you later add candidate accounts, you can notify them specifically.
    await Notification.create({
      title: "Application Update",
      message: `Your application status changed to ${status}`,
      type: "general",
      staffId: null,
    });

    res.json({ message: "Application status updated", application: app });
  } catch (error) {
    res.status(500).json({ message: "Failed to update application", error: error.message });
  }
};

// Public: withdraw application (if you allow)
export const withdrawApplication = async (req, res) => {
  try {
    const app = await Application.findByPk(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    app.status = "withdrawn";
    await app.save();

    await AuditLog.create({
      admin_id: req.user?.id || null,
      action: "WITHDRAW_APPLICATION",
      module: "Recruitment",
      details: `Application ${app.id} withdrawn by candidate`,
    });

    const io = req.app.get("io");
    if (io) io.emit("recruitment:applicationWithdrawn", { applicationId: app.id });

    res.json({ message: "Application withdrawn", application: app });
  } catch (error) {
    res.status(500).json({ message: "Failed to withdraw application", error: error.message });
  }
};
