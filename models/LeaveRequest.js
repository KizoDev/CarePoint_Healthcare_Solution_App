// Sequelize model for LeaveRequest
export default (sequelize, DataTypes) => {
  const LeaveRequest = sequelize.define("LeaveRequest", {
    leaveId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
   type: {
  type: DataTypes.ENUM("sick", "vacation", "unpaid"),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    allowNull: false,
    defaultValue: "pending",
  },

  }, {
    timestamps: true,
    underscored: true,
  });

  LeaveRequest.associate = (models) => {
    LeaveRequest.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
    LeaveRequest.belongsTo(models.Admin, { foreignKey: "approved_by", as: "approver" });
  };

  return LeaveRequest;
};
