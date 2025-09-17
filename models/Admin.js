// models/Admin.js
export default (sequelize, DataTypes) => {
  const Admin = sequelize.define(
    "Admin",
    {
      AdminId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("Active", "Inactive", "Suspended"),
        defaultValue: "Active",
      },
      role: {
        type: DataTypes.ENUM(
          "Super_admin",
          "Scheduler_admin",
          "Authorization_admin",
          "HR_admin",
          "Payroll_admin"
        ),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  Admin.associate = (models) => {
    // ✅ Core entities created by Admin
    Admin.hasMany(models.Shift, { foreignKey: "created_by", as: "createdShifts" });
    Admin.hasMany(models.Staff, { foreignKey: "created_by", as: "createdStaff" });
    Admin.hasMany(models.Client, { foreignKey: "created_by", as: "createdClients" });
    Admin.hasMany(models.Notification, { foreignKey: "created_by", as: "createdNotifications" });

    // ✅ Audit Logs
    Admin.hasMany(models.AuditLog, { foreignKey: "admin_id", as: "auditLogs" });

    // ✅ Recruitment process
    Admin.hasMany(models.JobPosting, { foreignKey: "created_by", as: "jobPostings" });
    Admin.hasMany(models.Interview, { foreignKey: "scheduled_by", as: "scheduledInterviews" });

    // ✅ Payroll
    Admin.hasMany(models.PayrollRun, { foreignKey: "processed_by", as: "payrollRuns" });

    // ✅ Performance Management
    Admin.hasMany(models.PerformanceReview, { foreignKey: "reviewed_by", as: "performanceReviews" });

    // ✅ Learning & Development
    Admin.hasMany(models.LearningCourse, { foreignKey: "created_by", as: "learningCourses" });

    // ✅ CarePoint Application reviews
    Admin.hasMany(models.CarePointApplication, { foreignKey: "reviewed_by", as: "reviewedApplications" });

    // ✅ Onboarding tasks assigned
    Admin.hasMany(models.Onboarding, { foreignKey: "assigned_by", as: "onboardingTasks" });
  };

  return Admin;
};
