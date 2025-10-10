import db from "../models/index.js";
const { PayrollRun, Payslip, Staff, AuditLog, Notification } = db;

// ✅ Create Payroll Run (no automatic payslip creation)
export const createPayrollRun = async (req, res) => {
  try {
    const { period_start, period_end, notes, title } = req.body;
    const adminId = req.user.id;

    // Create the payroll period
    const payrollRun = await PayrollRun.create({
      period_start,
      period_end,
      notes,
      title,
      processed_at: new Date(),
    });

    // 🧾 Audit Log
    await AuditLog.create({
      admin_id: adminId,
      action: "CREATE_PAYROLL_RUN",
      module: "Payroll",
      details: `Payroll run ${payrollRun.payrollRunId} created (no payslips yet)`,
      timestamp: new Date(),
    });

    res.status(201).json({
      message: "Payroll run created successfully. Add payslips separately.",
      payrollRun,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create payroll run", error: error.message });
  }
};

// ✅ Get all Payroll Runs
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

    res.status(200).json({
      total: runs.count,
      page: parseInt(page),
      pages: Math.ceil(runs.count / limit),
      data: runs.rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payroll runs", error: error.message });
  }
};

// ✅ Get Payroll Run by ID
export const getPayrollRunById = async (req, res) => {
  try {
    const run = await PayrollRun.findByPk(req.params.id, {
      include: [{ model: Payslip, as: "payslips" }],
    });
    if (!run) return res.status(404).json({ message: "Payroll run not found" });

    res.json(run);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payroll run", error: error.message });
  }
};

// ✅ Update Payroll Run
export const updatePayrollRun = async (req, res) => {
  try {
    const run = await PayrollRun.findByPk(req.params.id);
    if (!run) return res.status(404).json({ message: "Payroll run not found" });

    await run.update(req.body);

    await AuditLog.create({
      admin_id: req.user.id,
      action: "UPDATE_PAYROLL_RUN",
      module: "Payroll",
      details: `Payroll run ${run.payrollRunId} updated`,
      timestamp: new Date(),
    });

    res.json({ message: "Payroll run updated successfully", data: run });
  } catch (error) {
    res.status(500).json({ message: "Failed to update payroll run", error: error.message });
  }
};

// ✅ Create Individual Payslip
export const createPayslip = async (req, res) => {
  try {
    const { payrollRunId, staffId, basic_salary,gross_pay, deductions, net_pay } = req.body;

    const payslip = await Payslip.create({
      payrollRunId,
      staffId,
      basic_salary,
      gross_pay,
      deductions,
      net_pay,
    });

    await AuditLog.create({
      admin_id: req.user.id,
      action: "CREATE_PAYSLIP",
      module: "Payroll",
      details: `Payslip created for staff ${staffId} under payroll ${payrollRunId}`,
      timestamp: new Date(),
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`user_${staffId}`).emit("payslip:created", {
        message: "Your payslip has been generated.",
        payslip,
      });
    }

    await Notification.create({
      title: "Payslip Created",
      message: "Your payslip has been created successfully.",
      type: "payroll",
      recipientId: staffId,
    });

    res.status(201).json({ message: "Payslip created successfully", payslip });
  } catch (error) {
    res.status(500).json({ message: "Failed to create payslip", error: error.message });
  }
};

// ✅ Get All Payslips
export const getPayslips = async (req, res) => {
  try {
    const { staffId, payrollRunId, page = 1, limit = 20 } = req.query;
    const where = {};
    if (staffId) where.staff_id = staffId;
    if (payrollRunId) where.payroll_run_id = payrollRunId;

    const offset = (page - 1) * limit;
    const { count, rows } = await Payslip.findAndCountAll({
      where,
      order: [["issued_date", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payslips", error: error.message });
  }
};

// ✅ Get Single Payslip by ID
export const getPayslipById = async (req, res) => {
  try {
    const slip = await Payslip.findByPk(req.params.id);
    if (!slip) return res.status(404).json({ message: "Payslip not found" });
    res.json(slip);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payslip", error: error.message });
  }
};

// ✅ Update Payslip
export const updatePayslip = async (req, res) => {
  try {
    const slip = await Payslip.findByPk(req.params.id);
    if (!slip) return res.status(404).json({ message: "Payslip not found" });

    await slip.update(req.body);

    await AuditLog.create({
      admin_id: req.user.id,
      action: "UPDATE_PAYSLIP",
      module: "Payroll",
      details: `Payslip ${slip.payslipId} updated`,
      timestamp: new Date(),
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`user_${slip.staff_id}`).emit("payslip:updated", {
        message: "Your payslip has been updated.",
        payslip: slip,
      });
    }

    await Notification.create({
      title: "Payslip Updated",
      message: "Your payslip details have been updated.",
      type: "payroll",
      staffId: slip.staff_id,
    });

    res.json({ message: "Payslip updated successfully", payslip: slip });
  } catch (error) {
    res.status(500).json({ message: "Failed to update payslip", error: error.message });
  }
};

// ✅ Mark Payslip as Paid
export const markPayslipPaid = async (req, res) => {
  try {
    const slip = await Payslip.findByPk(req.params.id);
    if (!slip) return res.status(404).json({ message: "Payslip not found" });

    slip.paid = true;
    slip.paid_at = new Date();
    await slip.save();

    await AuditLog.create({
      admin_id: req.user.id,
      action: "MARK_PAYSLIP_PAID",
      module: "Payroll",
      details: `Payslip ${slip.payslipId} marked as paid`,
      timestamp: new Date(),
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`user_${slip.staff_id}`).emit("payslip:paid", {
        message: "Your payslip has been marked as paid.",
        payslip: slip,
      });
    }

    await Notification.create({
      title: "Payslip Paid",
      message: "Your payslip has been marked as paid.",
      type: "payroll",
      staffId: slip.staff_id,
    });

    res.json({ message: "Payslip marked as paid successfully", data: slip });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark payslip as paid", error: error.message });
  }
};
