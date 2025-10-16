import db from "../models/index.js";
const { PerformanceReview, Goal, Staff, AuditLog, Notification } = db;

// ✅ Create performance review
export const createReview = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { staffId, score, comments, review_date } = req.body;

    const review = await PerformanceReview.create({
      staff_id: staffId,
      score,
      comments,
      review_date,
    });

    // ✅ Audit log (standard format)
    await AuditLog.create({
      admin_id: req.user.id,
      action: "CREATE_REVIEW",
      module: "Performance",
      details: `HR_admin created performance review ${review.reviewId} for staff ${staffId}`,
      timestamp: new Date(),
    });

    // ✅ Notify staff
    const io = req.app.get("io");
    if (io) io.to(`user_${staffId}`).emit("performance:reviewCreated", { review });

    await Notification.create({
      title: "Performance Review",
      message: "A new performance review has been posted for you.",
      type: "performance",
      recipientId:staffId,
    });

    res.status(201).json({ message: "Performance review created successfully", data: review });
  } catch (err) {
    res.status(500).json({ message: "Failed to create performance review", error: err.message });
  }
};

// ✅ Get all performance reviews
export const getReviews = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { staffId, page = 1, limit = 20 } = req.query;
    const where = {};
    if (staffId) where.staff_id = staffId;

    const offset = (page - 1) * limit;
    const { count, rows } = await PerformanceReview.findAndCountAll({
      where,
      include: [{ model: Staff, as: "staff" }],
      order: [["review_date", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch performance reviews", error: err.message });
  }
};

// ✅ Get single review by ID
export const getReviewById = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const review = await PerformanceReview.findByPk(req.params.id, {
      include: [{ model: Staff, as: "staff" }],
    });
    if (!review) return res.status(404).json({ message: "Review not found" });

    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch review", error: err.message });
  }
};

// ✅ Update performance review
export const updateReview = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const review = await PerformanceReview.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    await review.update(req.body);

    await AuditLog.create({
      admin_id: req.user.id,
      action: "UPDATE_REVIEW",
      module: "Performance",
      details: `HR_admin updated performance review ${review.reviewId}`,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Performance review updated successfully", data: review });
  } catch (err) {
    res.status(500).json({ message: "Failed to update performance review", error: err.message });
  }
};

// ✅ Delete performance review
export const deleteReview = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const review = await PerformanceReview.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    await review.destroy();

    await AuditLog.create({
      admin_id: req.user.id,
      action: "DELETE_REVIEW",
      module: "Performance",
      details: `HR_admin deleted performance review ${req.params.id}`,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Performance review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete performance review", error: err.message });
  }
};

// ✅ Create performance goal
export const createGoal = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { staffId, description, target_date } = req.body;
    const goal = await Goal.create({ staff_id: staffId, description, target_date });

    await AuditLog.create({
      admin_id: req.user.id,
      action: "CREATE_GOAL",
      module: "Performance",
      details: `HR_admin created goal ${goal.goalId} for staff ${staffId}`,
      timestamp: new Date(),
    });

    res.status(201).json({ message: "Goal created successfully", data: goal });
  } catch (err) {
    res.status(500).json({ message: "Failed to create goal", error: err.message });
  }
};

// ✅ Update goal
export const updateGoal = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const goal = await Goal.findByPk(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    await goal.update(req.body);

    await AuditLog.create({
      admin_id: req.user.id,
      action: "UPDATE_GOAL",
      module: "Performance",
      details: `HR_admin updated goal ${goal.goalId}`,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Goal updated successfully", data: goal });
  } catch (err) {
    res.status(500).json({ message: "Failed to update goal", error: err.message });
  }
};

// ✅ Delete goal
export const deleteGoal = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const goal = await Goal.findByPk(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    await goal.destroy();

    await AuditLog.create({
      admin_id: req.user.id,
      action: "DELETE_GOAL",
      module: "Performance",
      details: `HR_admin deleted goal ${req.params.id}`,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete goal", error: err.message });
  }
};
