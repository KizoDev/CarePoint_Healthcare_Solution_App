// controllers/learningController.js
import db from "../models/index.js";
const { LearningCourse, Enrollment, Staff, AuditLog, Notification } = db;

const logAudit = async (adminId, action, moduleName, details) => {
  try { await AuditLog.create({ admin_id: adminId || null, action, module: moduleName, details }); }
  catch (e) { console.error("AuditLog failed:", e.message); }
};

export const createCourse = async (req, res) => {
  try {
    const course = await LearningCourse.create(req.body); // title, description, provider, start_date, end_date...
    await logAudit(req.user?.id, "CREATE_COURSE", "Learning", `Course ${course.courseId}`);
    res.status(201).json({ message: "Course created", data: course });
  } catch (err) {
    res.status(500).json({ message: "Failed to create course", error: err.message });
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await LearningCourse.findAll({ order: [["start_date", "DESC"]] });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch courses", error: err.message });
  }
};

export const enrollStaff = async (req, res) => {
  try {
    const { staffId, courseId } = req.body;
    const enrollment = await Enrollment.create({ staff_id: staffId, course_id: courseId });

    // notify staff
    const io = req.app.get("io");
    if (io) io.to(`user_${staffId}`).emit("learning:enrolled", { enrollment });
    await Notification.create({ title: "Training Enrollment", message: "You have been enrolled in a course", staffId });

    await logAudit(req.user?.id, "ENROLL_COURSE", "Learning", `Staff ${staffId} enrolled in ${courseId}`);
    res.status(201).json({ message: "Staff enrolled", data: enrollment });
  } catch (err) {
    res.status(500).json({ message: "Failed to enroll staff", error: err.message });
  }
};

export const getEnrollments = async (req, res) => {
  try {
    const { staffId, courseId } = req.query;
    const where = {};
    if (staffId) where.staff_id = staffId;
    if (courseId) where.course_id = courseId;
    const rows = await Enrollment.findAll({ where, include: [{ model: LearningCourse, as: "course" }] });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch enrollments", error: err.message });
  }
};

export const markEnrollmentComplete = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    enrollment.status = "completed";
    enrollment.completion_date = new Date();
    await enrollment.save();

    await logAudit(req.user?.id, "COMPLETE_ENROLLMENT", "Learning", `Enrollment ${enrollment.enrollmentId} completed`);
    const io = req.app.get("io");
    if (io) io.to(`user_${enrollment.staff_id}`).emit("learning:completed", { enrollment });
    await Notification.create({ title: "Training Completed", message: "You completed a training", staffId: enrollment.staff_id });

    res.json({ message: "Enrollment marked completed", data: enrollment });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark enrollment complete", error: err.message });
  }
};

export const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
    await enrollment.destroy();
    await logAudit(req.user?.id, "DELETE_ENROLLMENT", "Learning", `Enrollment ${req.params.id} deleted`);
    res.json({ message: "Enrollment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete enrollment", error: err.message });
  }
};
