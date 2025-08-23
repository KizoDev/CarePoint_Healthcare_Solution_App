// models/Attendance.js
export default (sequelize, DataTypes) => {
  const Attendance = sequelize.define("Attendance", {
    attendance_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    staff_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Present", "Absent", "On Leave"),
      defaultValue: "Present",
    },
    check_in: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    check_out: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total_hours: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  }, {
    timestamps: true,
    underscored: true,
    tableName: "attendance",
  });

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
  };

  return Attendance;
};
