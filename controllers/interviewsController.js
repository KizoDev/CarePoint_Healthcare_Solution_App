import db from "../models/index.js";
const { Interview, Application, Staff, AuditLog, Notification } = db;

// Admin: schedule interview
export const scheduleInterview = async (req, res) => {
  try {
    const { application_id, interviewer_staff_id, scheduled_at, mode, location, notes } = req.body;

    const app = await Application.findByPk(application_id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    const interview = await Interview.create({
      application_id,
      interviewer_staff_id,
      scheduled_at,
      mode,
      location,
      notes,
      status: "scheduled",
    });

    // Update application status to "interview_scheduled" (optional)
    app.status = "interview_scheduled";
    await app.save();

    await AuditLog.create({
      admin_id: req.user.id,
      action: "SCHEDULE_INTERVIEW",
      module: "Recruitment",
      details: `Interview ${interview.id} scheduled for application ${application_id}`,
    });

    // Notify interviewer staff (socket)
    const io = req.app.get("io");
    if (io && interviewer_staff_id) {
      io.to(`user_${interviewer_staff_id}`).emit("recruitment:interviewScheduled", {
        interviewId: interview.id,
        applicationId: application_id,
        scheduled_at,
      });
    }
    if (interviewer_staff_id) {
      await Notification.create({
        title: "Interview Assigned",
        message: `You have an interview scheduled at ${scheduled_at}`,
        type: "general",
        staffId: interviewer_staff_id,
      });
    }

    res.status(201).json({ message: "Interview scheduled", interview });
  } catch (error) {
    res.status(500).json({ message: "Failed to schedule interview", error: error.message });
  }
};

// Admin: update interview
export const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findByPk(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    await interview.update(req.body);

    await AuditLog.create({
      admin_id: req.user.id,
      action: "UPDATE_INTERVIEW",
      module: "Recruitment",
      details: `Interview ${interview.id} updated`,
    });

    // Notify interviewer of change
    const io = req.app.get("io");
    if (io && interview.interviewer_staff_id) {
      io.to(`user_${interview.interviewer_staff_id}`).emit("recruitment:interviewUpdated", {
        interviewId: interview.id,
      });
    }

    res.json({ message: "Interview updated", interview });
  } catch (error) {
    res.status(500).json({ message: "Failed to update interview", error: error.message });
  }
};

// Admin: cancel interview
export const cancelInterview = async (req, res) => {
  try {
    const interview = await Interview.findByPk(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.status = "cancelled";
    await interview.save();

    await AuditLog.create({
      admin_id: req.user.id,
      action: "CANCEL_INTERVIEW",
      module: "Recruitment",
      details: `Interview ${interview.id} cancelled`,
    });

    const io = req.app.get("io");
    if (io && interview.interviewer_staff_id) {
      io.to(`user_${interview.interviewer_staff_id}`).emit("recruitment:interviewCancelled", {
        interviewId: interview.id,
      });
    }

    res.json({ message: "Interview cancelled", interview });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel interview", error: error.message });
  }
};

// Admin: list interviews
export const getInterviews = async (req, res) => {
  try {
    const { application_id, interviewer_staff_id, status } = req.query;
    const where = {};
    if (application_id) where.application_id = application_id;
    if (interviewer_staff_id) where.interviewer_staff_id = interviewer_staff_id;
    if (status) where.status = status;

    const interviews = await Interview.findAll({
      where,
      include: [{ model: Application, as: "application" }],
      order: [["scheduled_at", "DESC"]],
    });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interviews", error: error.message });
  }
};

export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findByPk(req.params.id, {
      include: [{ model: Application, as: "application" }],
    });
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interview", error: error.message });
  }
};
