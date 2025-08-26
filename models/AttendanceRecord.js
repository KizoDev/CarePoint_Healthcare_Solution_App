// Sequelize model for AttendanceRecord
export default (sequelize, DataTypes) => {
  const AttendanceRecord = sequelize.define("AttendanceRecord", {
    attendanceId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING, // present, absent, late, on_leave
      allowNull: false,
    },
    check_in: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    check_out: {
      type: DataTypes.TIME,
      allowNull: true,
    },
  }, {
    timestamps: true,
    underscored: true,
  });

  AttendanceRecord.associate = (models) => {
    AttendanceRecord.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
  };

  return AttendanceRecord;
};
