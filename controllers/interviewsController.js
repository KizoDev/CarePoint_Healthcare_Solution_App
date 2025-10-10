// controllers/interviewController.js
import db from "../models/index.js";
const { Interview, JobApplication, Staff, AuditLog, Notification } = db;
import nodemailer from "nodemailer";

// 🟩 HR Only: Schedule Interview

// Helper for audit logs
const logAudit = async (adminId, action, module, details) => {
  try {
    await AuditLog.create({ admin_id: adminId, action, module, details });
  } catch (e) {
    console.error("AuditLog failed:", e.message);
  }
};

// Helper for sending emails (configure .env)
let mailTransporter = nodemailer.createTransport({
      host: "mail.skilltopims.com",  
      port: 587, 
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

// ✅ Schedule Interview (HR Admin only)
export const scheduleInterview = async (req, res) => {
  try {
    const role = req.user.role;
    if (role !== "HR_admin") {
      return res.status(401).json({ message: "You are not allowed to access this route" });
    }

    const { applicationId, interviewer_staff_id, scheduled_date, notes } = req.body;

    // Fetch job application with candidate info
    const app = await JobApplication.findByPk(applicationId);
    if (!app) return res.status(404).json({ message: "Application not found" });

    // Create interview
    const interview = await Interview.create({
      applicationId,
      interviewer_staff_id,
      scheduled_date,
      notes,
      status: "scheduled",
    });

    // Update application status
    app.status = "interview_scheduled";
    await app.save();

    // 🧾 Audit log
    await logAudit(req.user.id, "SCHEDULE_INTERVIEW", "Recruitment", `Interview ${interview.id} scheduled for ${applicationId}`);

    // 🔔 Notify interviewer (staff)
    const io = req.app.get("io");
    if (io && interviewer_staff_id) {
      io.to(`user_${interviewer_staff_id}`).emit("recruitment:interviewScheduled", {
        interviewId: interview.id,
        applicationId,
        scheduled_date,
      });
    }

    // Save notification in DB for interviewer
    await Notification.create({
      title: "Interview Assigned",
      message: `You have an interview scheduled on ${new Date(scheduled_date).toLocaleString()}`,
      type: "recruitment",
      recipientId: interviewer_staff_id,
      recipientType: "staff",
    });

    // ✉️ Send email to applicant
    let mailOption = {
      from: process.env.EMAIL_USER,
      to: app.candidate_email,
      subject: "Your Interview is Scheduled",
      html: `Dear ${app.candidate_name},\n\nYour interview for the ${app.job_title || "position"} has been scheduled on ${new Date(
        scheduled_date
      ).toLocaleString()}.\n\nBest of luck!\n\nCarePoint HR Team`
    };

    res.status(201).json({ message: "Interview scheduled successfully", data: interview });
  } catch (error) {
    console.error(error);
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
