// controllers/jobApplicationController.js
import db from "../models/index.js";
const { JobApplication, JobPosting, AuditLog, Notification } = db;

// 📌 Create a new job application (HR only)
export const createJobApplication = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { jobId, candidate_name, email, resume_url } = req.body;

    // ✅ 1. Validate job posting
    const job = await JobPosting.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job posting not found" });
    }

    // ✅ 2. Prevent applying to closed jobs
    if (job.status === "closed") {
      return res.status(400).json({ message: "Cannot apply to a closed job posting" });
    }

    // ✅ 3. Check if this email already applied for this job
    const existingApplication = await JobApplication.findOne({
      where: { jobId, email },
    });
    if (existingApplication) {
      return res.status(400).json({
        message: "This email has already applied for this job",
      });
    }

    // ✅ 4. Create application
    const application = await JobApplication.create({
      jobId,
      candidate_name,
      email,
      resume_url,
      status: "applied",
    });

    // ✅ 5. Audit Log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "CREATE_JOB_APPLICATION",
      module: "Recruitment",
      details: `HR_admin created a job application for candidate: ${candidate_name}, Job ID: ${jobId}`,
      timestamp: new Date(),
    });

    // ✅ 6. Realtime notification
    const io = req.app.get("io");
    if (io) {
      io.emit("recruitment:newApplication", {
        message: `New job application for ${job.title}`,
        application,
      });
    }

    res.status(201).json({
      message: "Job application created successfully",
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create job application",
      error: error.message,
    });
  }
};


// 📋 Get all job applications (HR only)
export const getJobApplications = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { status, jobId, email } = req.query;
    const where = {};
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;
    if (email) where.email = email;

    const applications = await JobApplication.findAll({
      where,
      include: [{ model: JobPosting, as: "jobPosting" }],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({ message: "Job applications retrieved", data: applications });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job applications", error: error.message });
  }
};

// 🔍 Get single application by ID
export const getJobApplicationById = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const application = await JobApplication.findByPk(req.params.id, {
      include: [{ model: JobPosting, as: "jobPosting" }],
    });

    if (!application) return res.status(404).json({ message: "Application not found" });

    res.json({ message: "Job application retrieved", data: application });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve job application", error: error.message });
  }
};

// ✏️ Update job application status (HR only)
export const updateJobApplicationStatus = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { status } = req.body;
    const application = await JobApplication.findByPk(req.params.id);

    if (!application) return res.status(404).json({ message: "Application not found" });

    application.status = status;
    await application.save();

    await AuditLog.create({
      admin_id: req.user.id,
      action: "UPDATE_APPLICATION_STATUS",
      module: "Recruitment",
      details: `HR_admin updated job application (${application.applicationId}) status to ${status}`,
      timestamp: new Date(),
    });

    await Notification.create({
      title: "Application Status Updated",
      message: `Application status for ${application.candidate_name} is now ${status}.`,
      recipientId: req.user.id,
      recipientType: "hr",
      type: "recruitment",
    });

    const io = req.app.get("io");
    if (io) io.emit("recruitment:applicationUpdated", { applicationId: application.applicationId, status });

    res.json({ message: "Application status updated successfully", data: application });
  } catch (error) {
    res.status(500).json({ message: "Failed to update application", error: error.message });
  }
};

// ❌ Delete/withdraw application (HR only)
export const withdrawApplication = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const application = await JobApplication.findByPk(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    await application.destroy();

    await AuditLog.create({
      admin_id: req.user.id,
      action: "DELETE_JOB_APPLICATION",
      module: "Recruitment",
      details: `HR_admin deleted job application (${application.applicationId})`,
      timestamp: new Date(),
    });

    await Notification.create({
      title: "Job Application Deleted",
      message: `A job application for ${application.candidate_name} has been deleted.`,
      recipientId: req.user.id,
      recipientType: "hr",
      type: "recruitment",
    });

    const io = req.app.get("io");
    if (io) io.emit("recruitment:applicationDeleted", { applicationId: application.applicationId });

    res.json({ message: "Job application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete application", error: error.message });
  }
};
