import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// Import models
import AdminModel from "./Admin.js"
import StaffModel from "./staffs.js";
import ClientModel from "./client.js";
import ShiftModel from "./shift.js";
import StaffDocumentModel from "./StaffDocument.js";
import ShiftAssignmentModel from "./shiftTemplate.js";
import AuditLogModel from "./auditLog.js";

// Initialize models
const Admin = AdminModel(sequelize, DataTypes);
const Staff = StaffModel(sequelize, DataTypes);
const Client = ClientModel(sequelize, DataTypes);
const Shift = ShiftModel(sequelize, DataTypes);
const StaffDocument = StaffDocumentModel(sequelize, DataTypes);
const ShiftAssignment = ShiftAssignmentModel(sequelize, DataTypes);
const AuditLog = AuditLogModel(sequelize, DataTypes);

// Create db object
const db = {
  sequelize,
  Admin,
  Staff,
  Client,
  Shift,
  StaffDocument,
  ShiftAssignment,
  AuditLog,
};

// Setup associations
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

export default db;
