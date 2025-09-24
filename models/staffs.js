export default (sequelize, DataTypes) => {
  const Staff = sequelize.define("Staff", {
    staffId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    role: {
      type: DataTypes.ENUM("Nurse", "Caregiver", "Doctor", "AdminStaff", "Other"),
      defaultValue: "Other",
    },
    hireDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.ENUM("Active", "Inactive", "Suspended"), defaultValue: "Active" },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [{ label: "Access_mobile_App", Access: true }],
    },
  }, {
    timestamps: true,
    underscored: true,
    tableName: "staff",
  });

  Staff.associate = (models) => {
    // ✅ Staff Documents
    Staff.hasMany(models.StaffDocument, {
      foreignKey: "staffId",
      as: "documents",
    });

    // ✅ Shifts
    Staff.belongsToMany(models.Shift, {
      through: "ShiftAssignments",
      foreignKey: "staff_id",
      as: "shifts",
    });

    // ✅ Payroll
    Staff.hasMany(models.Payslip, { foreignKey: "staff_id", as: "payslips" });

    // ✅ Benefits
    Staff.hasMany(models.StaffBenefit, { foreignKey: "staff_id", as: "staff_benefits" });

    // ✅ Attendance
    Staff.hasMany(models.Attendance, { foreignKey: "staff_id", as: "attendance_records" });

    // ✅ Leave Requests
    Staff.hasMany(models.LeaveRequest, { foreignKey: "staff_id", as: "leave_requests" });

    // ✅ Performance Reviews
    Staff.hasMany(models.PerformanceReview, { foreignKey: "staff_id", as: "performance_reviews" });

    // ✅ Goals
    Staff.hasMany(models.Goal, { foreignKey: "staff_id", as: "goals" });

    // ✅ Learning Enrollments
    Staff.hasMany(models.Enrollment, { foreignKey: "staff_id", as: "enrollments" });

    // ✅ CarePoint Applications
    Staff.hasMany(models.CarePointApplication, { foreignKey: "staff_id", as: "applications" });

    // ✅ Notifications
    Staff.hasMany(models.Notification, { foreignKey: "staff_id", as: "notifications" });

    // ✅ Audit Logs
    Staff.hasMany(models.AuditLog, { foreignKey: "admin_id", as: "audit_logs" });
  };

  return Staff;
};
