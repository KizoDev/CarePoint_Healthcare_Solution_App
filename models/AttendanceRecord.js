// Sequelize model for AttendanceRecord
export default (sequelize, DataTypes) => {
  const AttendanceRecord = sequelize.define(
    "AttendanceRecord",
    {
      attendanceId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      staff_id: {
        type: DataTypes.UUID,
        allowNull: false, // ✅ staff_id should not have a default UUID, it's a foreign key
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW, // auto set today's date
      },
      status: {
        type: DataTypes.ENUM("present", "absent", "late", "on_leave"),
        allowNull: false,
        defaultValue: "present", // default when HR checks in staff
      },
      check_in: {
        type: DataTypes.DATE, // ✅ fixed
        allowNull: true,
      },
      check_out: {
        type: DataTypes.DATE, // ✅ fixed
        allowNull: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: "attendance_records",
    }
  );

  AttendanceRecord.associate = (models) => {
    AttendanceRecord.belongsTo(models.Staff, {
      foreignKey: "staff_id",
      as: "staff",
      onDelete: "CASCADE", // remove attendance if staff is deleted
    });
  };

  return AttendanceRecord;
};
