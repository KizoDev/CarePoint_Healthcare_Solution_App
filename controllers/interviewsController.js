// controllers/interviewController.js
import db from "../models/index.js";
const { Interview, JobApplication, Staff, AuditLog, Notification } = db;

// 🟩 HR Only: Schedule Interview
export const scheduleInterview = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { applicationId, interviewer_staff_id, scheduled_date, notes } = req.body;

    // Validate job application
    const app = await JobApplication.findByPk(applicationId);
    if (!app) return res.status(404).json({ message: "Application not found" });

    // Create interview
    const interview = await Interview.create({
      application_id: applicationId,
      interviewer_staff_id,
      scheduled_date,
      notes,
      status: "scheduled",
    });

    // Update application status
    app.status = "interview_scheduled";
    await app.save();

    // 🧾 Audit log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "SCHEDULE_INTERVIEW",
      module: "Recruitment",
      details: `HR_admin scheduled interview (${interview.id}) for application ${applicationId}`,
      timestamp: new Date(),
    });

    // 🔔 Notify interviewer
    const io = req.app.get("io");
    if (io && interviewer_staff_id) {
      io.to(`user_${interviewer_staff_id}`).emit("recruitment:interviewScheduled", {
        message: "You have been assigned to an interview.",
        interviewId: interview.id,
        scheduled_date,
      });
    }

    await Notification.create({
      title: "Interview Scheduled",
      message: `You have an interview scheduled on ${scheduled_date}.`,
      type: "recruitment",
      staffId: interviewer_staff_id,
    });

    res.status(201).json({ message: "Interview scheduled successfully", data: interview });
  } catch (error) {
    res.status(500).json({ message: "Failed to schedule interview", error: error.message });
  }
};

// 🟨 HR Only: Update Interview
export const updateInterview = async (req, res) => {
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const interview = await Interview.findByPk(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    await interview.update(req.body);

    // 🧾 Audit log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "UPDATE_INTERVIEW",
      module: "Recruitment",
      details: `HR_admin updated interview (${interview.id})`,
      timestamp: new Date(),
    });

    // 🔔 Notify interviewer
    const io = req.app.get("io");
    if (io && interview.interviewer_staff_id) {
      io.to(`user_${interview.interviewer_staff_id}`).emit("recruitment:interviewUpdated", {
        message: "An interview assigned to you has been updated.",
        interviewId: interview.id,
      });
    }

    await Notification.create({
      title: "Interview Updated",
      message: "An interview you are assigned to has been updated.",
      type: "recruitment",
      staffId: interview.interviewer_staff_id,
    });

    res.json({ message: "Interview updated successfully", data: interview });
  } catch (error) {
    res.status(500).json({ message: "Failed to update interview", error: error.message });
  }
};

// 🟥 HR Only: Cancel Interview
export const cancelInterview = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const interview = await Interview.findByPk(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.status = "cancelled";
    await interview.save();

    // 🧾 Audit log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "CANCEL_INTERVIEW",
      module: "Recruitment",
      details: `HR_admin cancelled interview (${interview.id})`,
      timestamp: new Date(),
    });

    // 🔔 Notify interviewer
    const io = req.app.get("io");
    if (io && interview.interviewer_staff_id) {
      io.to(`user_${interview.interviewer_staff_id}`).emit("recruitment:interviewCancelled", {
        message: "An interview you were assigned to has been cancelled.",
        interviewId: interview.id,
      });
    }

    await Notification.create({
      title: "Interview Cancelled",
      message: "An interview assigned to you has been cancelled.",
      type: "recruitment",
      staffId: interview.interviewer_staff_id,
    });

    res.json({ message: "Interview cancelled successfully", data: interview });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel interview", error: error.message });
  }
};

// 🟦 HR Only: Get all interviews
export const getInterviews = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { application_id, interviewer_staff_id, status } = req.query;
    const where = {};
    if (application_id) where.application_id = application_id;
    if (interviewer_staff_id) where.interviewer_staff_id = interviewer_staff_id;
    if (status) where.status = status;

    const interviews = await Interview.findAll({
      where,
      include: [{ model: JobApplication, as: "application" }],
      order: [["scheduled_date", "DESC"]],
    });

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interviews", error: error.message });
  }
};

// 🟪 HR Only: Get single interview
export const getInterviewById = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const interview = await Interview.findByPk(req.params.id, {
      include: [{ model: JobApplication, as: "application" }],
    });
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interview", error: error.message });
  }
};
