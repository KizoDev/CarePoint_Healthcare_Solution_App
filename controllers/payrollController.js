import db from "../models/index.js";
const { Payroll, Staff, AuditLog } = db;

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

export const createPayroll = async (req, res) => {
  try {
    const payload = req.body; // { staffId, periodStart, periodEnd, grossPay, deductions, netPay, status }
    const payroll = await Payroll.create(payload);

    await logAudit(req, "create", "Payroll", { payrollId: payroll.id, staffId: payroll.staffId });

    const io = req.app.get("io");
    if (io) io.to(`user_${payroll.staffId}`).emit("payrollCreated", payroll);

    res.status(201).json({ message: "Payroll created", data: payroll });
  } catch (err) {
    res.status(500).json({ message: "Failed to create payroll", error: err.message });
  }
};

export const getPayrolls = async (req, res) => {
  try {
    const { staffId, status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (staffId) where.staffId = staffId;
    if (status) where.status = status;

    const { count, rows } = await Payroll.findAndCountAll({
      where,
      include: [{ model: Staff, as: "staff", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payrolls", error: err.message });
  }
};

export const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id, {
      include: [{ model: Staff, as: "staff", attributes: ["id", "name", "email"] }],
    });
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payroll", error: err.message });
  }
};

export const updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });

    await payroll.update(req.body);
    await logAudit(req, "update", "Payroll", { payrollId: payroll.id });

    res.json({ message: "Payroll updated", data: payroll });
  } catch (err) {
    res.status(500).json({ message: "Failed to update payroll", error: err.message });
  }
};

export const markPayrollPaid = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });

    payroll.status = "paid";
    await payroll.save();

    await logAudit(req, "status_change", "Payroll", { payrollId: payroll.id, status: "paid" });

    const io = req.app.get("io");
    if (io) io.to(`user_${payroll.staffId}`).emit("payrollPaid", payroll);

    res.json({ message: "Payroll marked as paid", data: payroll });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark payroll as paid", error: err.message });
  }
};

export const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });
    await payroll.destroy();

    await logAudit(req, "delete", "Payroll", { payrollId: req.params.id });

    res.json({ message: "Payroll deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete payroll", error: err.message });
  }
};
