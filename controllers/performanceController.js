
import db from "../models/index.js";
const { Performance, Staff, AuditLog } = db;

const logAudit = async (req, action, module, details) => {
  try {
    await AuditLog.create({
      admin_id: req.user?.id,
      action,
      module,
      details: details ? JSON.stringify(details) : null,
    });
  } catch (e) {
    console.error("Audit log failed:", e.message);
  }
};

export const createReview = async (req, res) => {
  try {
    const review = await Performance.create(req.body); // { staffId, reviewPeriodStart, reviewPeriodEnd, rating, comments, goals }
    await logAudit(req, "create", "Performance", { reviewId: review.id, staffId: review.staffId });

    const io = req.app.get("io");
    if (io) io.to(`user_${review.staffId}`).emit("performanceReviewCreated", review);

    res.status(201).json({ message: "Performance review created", data: review });
  } catch (err) {
    res.status(500).json({ message: "Failed to create review", error: err.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { staffId, page = 1, limit = 20 } = req.query;
    const where = {};
    if (staffId) where.staffId = staffId;

    const { count, rows } = await Performance.findAndCountAll({
      where,
      include: [{ model: Staff, as: "staff", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ total: count, page: parseInt(page), pages: Math.ceil(count / limit), data: rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews", error: err.message });
  }
};

export const getReviewById = async (req, res) => {
  try {
    const review = await Performance.findByPk(req.params.id, {
      include: [{ model: Staff, as: "staff", attributes: ["id", "name", "email"] }],
    });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch review", error: err.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Performance.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    await review.update(req.body);
    await logAudit(req, "update", "Performance", { reviewId: review.id });

    res.json({ message: "Review updated", data: review });
  } catch (err) {
    res.status(500).json({ message: "Failed to update review", error: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Performance.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    await review.destroy();
    await logAudit(req, "delete", "Performance", { reviewId: req.params.id });

    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete review", error: err.message });
  }
};
