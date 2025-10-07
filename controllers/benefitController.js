// controllers/benefitController.js
import db from "../models/index.js";
const { BenefitPlan, StaffBenefit, Staff, AuditLog, Notification } = db;

export const createBenefitPlan = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { name, description, type } = req.body;
    const plan = await BenefitPlan.create({ name, description, type });

    // Audit
    await AuditLog.create({
      admin_id: req.user.id,
      action: "Create Benefit Plan",
      module: "benefits",
      details: `Created benefit plan: ${plan.name} (ID: ${plan.benefitPlanId})`,
      timestamp: new Date(),
    });

    res.status(201).json({ message: "Benefit plan created", data: plan });
  } catch (err) {
    res.status(500).json({ message: "Failed to create benefit plan", error: err.message });
  }
};

export const getBenefitPlans = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const plans = await BenefitPlan.findAll({ order: [["created_at", "DESC"]] });

    // Audit
    await AuditLog.create({
      admin_id: req.user.id,
      action: "View Benefit Plans",
      module: "benefits",
      details: "Fetched all benefit plans",
      timestamp: new Date(),
    });

    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch benefit plans", error: err.message });
  }
};

export const assignStaffBenefit = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { staffId, planId } = req.body;
    const enrollment = await StaffBenefit.create({ staff_id: staffId, benefit_plan_id: planId });

    // 🔔 Notify staff
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${staffId}`).emit("benefitAssigned", {
        message: "You were assigned a benefit plan",
        enrollment,
      });
    }

   await Notification.create({
  title: "Benefit Assigned",
  message: "You were assigned a benefit plan",
  type: "general",
  recipientId: staffId,   
  recipientType: "staff",    
});

    // Audit
    await AuditLog.create({
      admin_id: req.user.id,
      action: "Assign Benefit",
      module: "benefits",
      details: `Assigned plan ${planId} to staff ${staffId}`,
      timestamp: new Date(),
    });

    res.status(201).json({ message: "Staff benefit assigned", data: enrollment });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign benefit", error: err.message });
  }
};

export const getStaffBenefits = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { staffId } = req.query;
    const where = {};
    if (staffId) where.staff_id = staffId;

    const rows = await StaffBenefit.findAll({
      where,
      include: [{ model: BenefitPlan, as: "benefitPlan" }],
    });

    // Audit
    await AuditLog.create({
      admin_id: req.user.id,
      action: "View Staff Benefits",
      module: "benefits",
      details: staffId
        ? `Fetched benefits for staff ${staffId}`
        : "Fetched all staff benefits",
      timestamp: new Date(),
    });

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch staff benefits", error: err.message });
  }
};

export const removeStaffBenefit = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const enrollment = await StaffBenefit.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ message: "StaffBenefit not found" });

    await enrollment.destroy();

    // Audit
    await AuditLog.create({
      admin_id: req.user.id,
      action: "Remove Benefit",
      module: "benefits",
      details: `Removed staff benefit enrollment ${req.params.id}`,
      timestamp: new Date(),
    });

    res.json({ message: "Staff benefit removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove staff benefit", error: err.message });
  }
};
