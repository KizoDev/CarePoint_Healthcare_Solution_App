export default (sequelize, DataTypes) => {
  const Shift = sequelize.define("Shift", {
    shiftId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    staffId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "assigned", "completed", "cancelled"),
      defaultValue: "pending",
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    timestamps: true,
    underscored: true,
  });

  Shift.associate = (models) => {
    Shift.belongsTo(models.Client, { foreignKey: "client_id", as: "client" });
    Shift.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
    Shift.belongsTo(models.Admin, { foreignKey: "created_by", as: "creator" });
  };

  return Shift;
};