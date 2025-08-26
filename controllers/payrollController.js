// controllers/payrollController.js
import db from "../models/index.js";
const { PayrollRun, Payslip, Staff, AuditLog, Notification } = db;

const logAudit = async (adminId, action, moduleName, details) => {
  try {
    await AuditLog.create({ admin_id: adminId || null, action, module: moduleName, details });
  } catch (e) {
    console.error("AuditLog failed:", e.message);
  }
};

// Create payroll run and (optionally) generate payslips for selected staff or all staff
export const createPayrollRun = async (req, res) => {
  try {
    const { period_start, period_end, staffIds = null } = req.body; // staffIds optional array
    const adminId = req.user?.id;

    const run = await PayrollRun.create({ period_start, period_end });

    // Select staff
    const staffWhere = staffIds && staffIds.length ? { id: staffIds } : {};
    const staffList = await Staff.findAll({ where: staffWhere });

    // Create payslips (basic placeholders -> finance can update amounts)
    const payslips = [];
    for (const s of staffList) {
      const slip = await Payslip.create({
        payroll_run_id: run.payrollRunId,
        staff_id: s.staff_id || s.id,
        gross_pay: 0.0,
        deductions: 0.0,
        net_pay: 0.0,
      });
      payslips.push(slip);

      // socket + DB notification
      const io = req.app.get("io");
      if (io) io.to(`user_${s.staff_id || s.id}`).emit("payslip:created", { message: "Payslip available", payslip: slip });
      await Notification.create({ title: "Payslip available", message: "A new payslip has been generated for you", staffId: s.staff_id || s.id });
    }

    await logAudit(adminId, "CREATE_PAYROLL_RUN", "Payroll", `PayrollRun ${run.payrollRunId} created, payslips: ${payslips.length}`);

    res.status(201).json({ message: "Payroll run created", payrollRun: run, payslipsCount: payslips.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to create payroll run", error: err.message });
  }
};

// Get all payroll runs (with paging)
export const getPayrollRuns = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const runs = await PayrollRun.findAndCountAll({
      include: [{ model: Payslip, as: "payslips" }],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json({ total: runs.count, page: parseInt(page), pages: Math.ceil(runs.count / limit), data: runs.rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payroll runs", error: err.message });
  }
};

export const getPayrollRunById = async (req, res) => {
  try {
    const run = await PayrollRun.findByPk(req.params.id, { include: [{ model: Payslip, as: "payslips" }] });
    if (!run) return res.status(404).json({ message: "Payroll run not found" });
    res.json(run);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payroll run", error: err.message });
  }
};

// Update a payroll run metadata
export const updatePayrollRun = async (req, res) => {
  try {
    const run = await PayrollRun.findByPk(req.params.id);
    if (!run) return res.status(404).json({ message: "Payroll run not found" });

    await run.update(req.body);
    await logAudit(req.user?.id, "UPDATE_PAYROLL_RUN", "Payroll", `PayrollRun ${run.payrollRunId} updated`);
    res.json({ message: "Payroll run updated", data: run });
  } catch (err) {
    res.status(500).json({ message: "Failed to update payroll run", error: err.message });
  }
};

// Payslip endpoints
export const getPayslips = async (req, res) => {
  try {
    const { staffId, payrollRunId, page = 1, limit = 50 } = req.query;
    const where = {};
    if (staffId) where.staff_id = staffId;
    if (payrollRunId) where.payroll_run_id = payrollRunId;
    const offset = (page - 1) * limit;
    const { count, rows } = await Payslip.findAndCountAll({ where, order: [["issued_date", "DESC"]], limit: parseInt(limit), offset: parseInt(offset) });
    res.json({ total: count, page: parseInt(page), pages: Math.ceil(count / limit), data: rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payslips", error: err.message });
  }
};

export const getPayslipById = async (req, res) => {
  try {
    const slip = await Payslip.findByPk(req.params.id);
    if (!slip) return res.status(404).json({ message: "Payslip not found" });
    res.json(slip);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payslip", error: err.message });
  }
};

// Update payslip (finance) - partial amounts
export const updatePayslip = async (req, res) => {
  try {
    const slip = await Payslip.findByPk(req.params.id);
    if (!slip) return res.status(404).json({ message: "Payslip not found" });

    await slip.update(req.body);

    await logAudit(req.user?.id, "UPDATE_PAYSLIP", "Payroll", `Payslip ${slip.payslipId} updated`);
    // Notify staff of update
    const io = req.app.get("io");
    if (io) io.to(`user_${slip.staff_id}`).emit("payslip:updated", { payslip: slip });
    await Notification.create({ title: "Payslip updated", message: "Your payslip has been updated", staffId: slip.staff_id });

    res.json({ message: "Payslip updated", data: slip });
  } catch (err) {
    res.status(500).json({ message: "Failed to update payslip", error: err.message });
  }
};

// Mark payslip as paid (or a status change)
export const markPayslipPaid = async (req, res) => {
  try {
    const slip = await Payslip.findByPk(req.params.id);
    if (!slip) return res.status(404).json({ message: "Payslip not found" });

    slip.paid = true;
    slip.paid_at = new Date();
    await slip.save();

    await logAudit(req.user?.id, "MARK_PAYSLIP_PAID", "Payroll", `Payslip ${slip.payslipId} marked paid`);
    const io = req.app.get("io");
    if (io) io.to(`user_${slip.staff_id}`).emit("payslip:paid", { payslip: slip });
    await Notification.create({ title: "Payslip paid", message: "Your payslip has been paid", staffId: slip.staff_id });

    res.json({ message: "Payslip marked as paid", data: slip });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark payslip as paid", error: err.message });
  }
};
