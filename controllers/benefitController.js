// controllers/benefitController.js
import db from "../models/index.js";
const { BenefitPlan, StaffBenefit, Staff, AuditLog, Notification } = db;

const logAudit = async (adminId, action, moduleName, details) => {
  try {
    await AuditLog.create({ admin_id: adminId || null, action, module: moduleName, details });
  } catch (e) { console.error("AuditLog failed:", e.message); }
};

export const createBenefitPlan = async (req, res) => {
  try {
    const { name, description, type } = req.body;
    const plan = await BenefitPlan.create({ name, description, type });
    await logAudit(req.user?.id, "CREATE_BENEFIT_PLAN", "Benefits", `Plan ${plan.benefitPlanId}`);
    res.status(201).json({ message: "Benefit plan created", data: plan });
  } catch (err) {
    res.status(500).json({ message: "Failed to create benefit plan", error: err.message });
  }
};

export const getBenefitPlans = async (req, res) => {
  try {
    const plans = await BenefitPlan.findAll({ order: [["created_at", "DESC"]] });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch benefit plans", error: err.message });
  }
};

export const assignStaffBenefit = async (req, res) => {
  try {
    const { staffId, planId } = req.body;
    const enrollment = await StaffBenefit.create({ staff_id: staffId, benefit_plan_id: planId });

    // notify staff
    const io = req.app.get("io");
    if (io) io.to(`user_${staffId}`).emit("benefit:assigned", { message: "You were assigned a benefit plan", enrollment });
    await Notification.create({ title: "Benefit Assigned", message: "You were assigned a benefit plan", staffId });

    await logAudit(req.user?.id, "ASSIGN_BENEFIT", "Benefits", `Assigned plan ${planId} to staff ${staffId}`);
    res.status(201).json({ message: "Staff benefit assigned", data: enrollment });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign benefit", error: err.message });
  }
};

export const getStaffBenefits = async (req, res) => {
  try {
    const { staffId } = req.query;
    const where = {};
    if (staffId) where.staff_id = staffId;
    const rows = await StaffBenefit.findAll({ where, include: [{ model: BenefitPlan, as: "benefitPlan" }] });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch staff benefits", error: err.message });
  }
};

export const removeStaffBenefit = async (req, res) => {
  try {
    const enrollment = await StaffBenefit.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ message: "StaffBenefit not found" });
    await enrollment.destroy();
    await logAudit(req.user?.id, "REMOVE_BENEFIT", "Benefits", `Removed enrollment ${req.params.id}`);
    res.json({ message: "Staff benefit removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove staff benefit", error: err.message });
  }
};
