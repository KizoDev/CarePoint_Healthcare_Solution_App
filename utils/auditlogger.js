// utils/auditLogger.js
import db from "../models/index.js";

const { AuditLog } = db;

export const logAction = async (adminId, action, module, details = null) => {
  try {
    await AuditLog.create({
      admin_id: adminId,
      action,
      module,
      details: details ? JSON.stringify(details) : null,
    });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
};
