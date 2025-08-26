// models/Staff.js
export default (sequelize, DataTypes) => {
  const Staff = sequelize.define(
    "Staff",
    {
      staff_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM(
          "Nurse",
          "Caregiver",
          "Doctor",
          "AdminStaff",
          "Other"
        ),
        defaultValue: "Other",
      },
      hire_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM("Active", "Inactive", "Suspended"),
        defaultValue: "Active",
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: "staff",
    }
  );

  Staff.associate = (models) => {
    // ✅ Shifts (many-to-many)
    Staff.belongsToMany(models.Shift, {
      through: "ShiftAssignments",
      foreignKey: "staff_id",
      as: "shifts",
    });

    // ✅ Payroll (through Payslips, not PayrollRun directly)
    Staff.hasMany(models.Payslip, {
      foreignKey: "staff_id",
      as: "payslips",
    });

    // ✅ Benefits
    Staff.hasMany(models.StaffBenefit, {
      foreignKey: "staff_id",
      as: "staff_benefits",
    });

    // ✅ Attendance
    Staff.hasMany(models.Attendance, {
      foreignKey: "staff_id",
      as: "attendance_records",
    });

    // ✅ Leave Requests
    Staff.hasMany(models.LeaveRequest, {
      foreignKey: "staff_id",
      as: "leave_requests",
    });

    // ✅ Performance Reviews
    Staff.hasMany(models.PerformanceReview, {
      foreignKey: "staff_id",
      as: "performance_reviews",
    });

    // ✅ Goals
    Staff.hasMany(models.Goal, {
      foreignKey: "staff_id",
      as: "goals",
    });

    // ✅ Learning Enrollments
    Staff.hasMany(models.Enrollment, {
      foreignKey: "staff_id",
      as: "enrollments",
    });

    // ✅ CarePoint Applications
    Staff.hasMany(models.CarePointApplication, {
      foreignKey: "staff_id",
      as: "applications",
    });

    // ✅ Notifications
    Staff.hasMany(models.Notification, {
      foreignKey: "staff_id",
      as: "notifications",
    });

    // ✅ Audit Logs (for actions done by staff if they’re admins too)
    Staff.hasMany(models.AuditLog, {
      foreignKey: "admin_id",
      as: "audit_logs",
    });
  };

  return Staff;
};
