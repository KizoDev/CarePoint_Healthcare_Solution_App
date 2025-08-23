// models/Staff.js
export default (sequelize, DataTypes) => {
  const Staff = sequelize.define("Staff", {
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
      type: DataTypes.ENUM("Nurse", "Caregiver", "Doctor", "AdminStaff", "Other"),
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
  }, {
    timestamps: true,
    underscored: true,
    tableName: "staff",
  });

  Staff.associate = (models) => {
    // Shifts
    Staff.belongsToMany(models.Shift, {
      through: "ShiftAssignments",
      foreignKey: "staff_id",
      as: "shifts",
    });

    // Payroll
    Staff.hasMany(models.Payroll, { foreignKey: "staff_id", as: "payrolls" });

    // Benefits
    Staff.hasMany(models.Benefit, { foreignKey: "staff_id", as: "benefits" });

    // Attendance
    Staff.hasMany(models.Attendance, { foreignKey: "staff_id", as: "attendance_records" });

    // Performance
    Staff.hasMany(models.Performance, { foreignKey: "staff_id", as: "performances" });

    // CarePoint Applications (leave requests, shift changes etc.)
    Staff.hasMany(models.CarePointApplication, { foreignKey: "staff_id", as: "applications" });

    // Notifications (if Staff can receive them)
    Staff.hasMany(models.Notification, { foreignKey: "staff_id", as: "notifications" });
  };

  return Staff;
};
