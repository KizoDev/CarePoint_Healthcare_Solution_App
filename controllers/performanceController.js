// controllers/performanceController.js
import db from "../models/index.js";
const { PerformanceReview, Goal, Staff, AuditLog, Notification } = db;

const logAudit = async (adminId, action, moduleName, details) => {
  try { await AuditLog.create({ admin_id: adminId || null, action, module: moduleName, details }); }
  catch (e) { console.error("AuditLog failed:", e.message); }
}

// Create review
export const createReview = async (req, res) => {
  try {
    const { staffId, score, comments, review_date } = req.body;
    const review = await PerformanceReview.create({ staff_id: staffId, score, comments, review_date });
    await logAudit(req.user?.id, "CREATE_REVIEW", "Performance", `Review ${review.reviewId} for staff ${staffId}`);

    // notify staff
    const io = req.app.get("io");
    if (io) io.to(`user_${staffId}`).emit("performance:reviewCreated", { review });
    await Notification.create({ title: "Performance Review", message: "A new performance review has been posted", staffId });

    res.status(201).json({ message: "Review created", data: review });
  } catch (err) {
    res.status(500).json({ message: "Failed to create review", error: err.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { staffId, page = 1, limit = 20 } = req.query;
    const where = {};
    if (staffId) where.staff_id = staffId;
    const offset = (page - 1) * limit;
    const { count, rows } = await PerformanceReview.findAndCountAll({ where, order: [["review_date", "DESC"]], limit: parseInt(limit), offset: parseInt(offset) });
    res.json({ total: count, page: parseInt(page), pages: Math.ceil(count / limit), data: rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews", error: err.message });
  }
};

export const getReviewById = async (req, res) => {
  try {
    const review = await PerformanceReview.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch review", error: err.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    await review.update(req.body);
    await logAudit(req.user?.id, "UPDATE_REVIEW", "Performance", `Review ${review.reviewId} updated`);
    res.json({ message: "Review updated", data: review });
  } catch (err) {
    res.status(500).json({ message: "Failed to update review", error: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    await review.destroy();
    await logAudit(req.user?.id, "DELETE_REVIEW", "Performance", `Review ${req.params.id} deleted`);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete review", error: err.message });
  }
};

// Goals
export const createGoal = async (req, res) => {
  try {
    const { staffId, description, target_date } = req.body;
    const goal = await Goal.create({ staff_id: staffId, description, target_date });
    await logAudit(req.user?.id, "CREATE_GOAL", "Performance", `Goal ${goal.goalId} for staff ${staffId}`);
    res.status(201).json({ message: "Goal created", data: goal });
  } catch (err) {
    res.status(500).json({ message: "Failed to create goal", error: err.message });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findByPk(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    await goal.update(req.body);
    await logAudit(req.user?.id, "UPDATE_GOAL", "Performance", `Goal ${goal.goalId} updated`);
    res.json({ message: "Goal updated", data: goal });
  } catch (err) {
    res.status(500).json({ message: "Failed to update goal", error: err.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findByPk(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    await goal.destroy();
    await logAudit(req.user?.id, "DELETE_GOAL", "Performance", `Goal ${req.params.id} deleted`);
    res.json({ message: "Goal deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete goal", error: err.message });
  }
};
