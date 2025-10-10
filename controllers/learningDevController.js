// controllers/learningController.js
import db from "../models/index.js";
const { LearningCourse, Enrollment, Staff, AuditLog, Notification } = db;

// Create new learning course (HR only)
export const createCourse = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const course = await LearningCourse.create(req.body);

    // 🔒 Audit log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "CREATE_COURSE",
      module: "Learning",
      details: `HR_admin created course: ${course.title} (${course.courseId})`,
      timestamp: new Date(),
    });

    res.status(201).json({ message: "Course created successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "Failed to create course", error: error.message });
  }
};

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await LearningCourse.findAll({ order: [["start_date", "DESC"]] });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses", error: error.message });
  }
};

// Enroll staff in a course (HR only)
export const enrollStaff = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { staffId, courseId } = req.body;
    const enrollment = await Enrollment.create({ staff_id: staffId, course_id: courseId });

    // 🔔 Notify staff
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${staffId}`).emit("learning:enrolled", {
        message: "You have been enrolled in a course",
        enrollment,
      });
    }

    await Notification.create({
      title: "Training Enrollment",
      message: "You have been enrolled in a course.",
      type: "learning",
      recipientId: req.user.id,
      //recipientType: "hr",
    });

    // 🧾 Audit log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "ENROLL_COURSE",
      module: "Learning",
      details: `HR_admin enrolled staff ${staffId} in course ${courseId}`,
      timestamp: new Date(),
    });

    res.status(201).json({ message: "Staff enrolled successfully", data: enrollment });
  } catch (error) {
    res.status(500).json({ message: "Failed to enroll staff", error: error.message });
  }
};

// Get enrollments (HR only)
export const getEnrollments = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { staffId, courseId } = req.query;
    const where = {};
    if (staffId) where.staff_id = staffId;
    if (courseId) where.course_id = courseId;

    const rows = await Enrollment.findAll({
      where,
      include: [{ model: LearningCourse, as: "course" }],
    });

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enrollments", error: error.message });
  }
};

// Mark an enrollment as completed (HR only)
export const markEnrollmentComplete = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    enrollment.status = "completed";
    enrollment.completion_date = new Date();
    await enrollment.save();

    // 🔔 Notify staff
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${enrollment.staff_id}`).emit("learning:completed", {
        message: "You have completed a training course.",
        enrollment,
      });
    }

    await Notification.create({
      title: "Training Completed",
      message: "You completed a training course.",
      type: "learning",
      staffId: enrollment.staff_id,
    });

    // Audit log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "COMPLETE_ENROLLMENT",
      module: "Learning",
      details: `HR_admin marked enrollment ${enrollment.enrollmentId} as completed`,
      timestamp: new Date(),
    });

    res.json({ message: "Enrollment marked as completed", data: enrollment });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark enrollment complete", error: error.message });
  }
};

// Delete an enrollment (HR only)
export const deleteEnrollment = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    await enrollment.destroy();

    // 🧾 Audit log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "DELETE_ENROLLMENT",
      module: "Learning",
      details: `HR_admin deleted enrollment ${req.params.id}`,
      timestamp: new Date(),
    });

    res.json({ message: "Enrollment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete enrollment", error: error.message });
  }
};
