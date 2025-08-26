// Sequelize model for CarePointApplication
export default (sequelize, DataTypes) => {
  const CarePointApplication = sequelize.define("CarePointApplication", {
    applicationId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    status: {
      type: DataTypes.STRING, // pending, approved, rejected
      defaultValue: "pending",
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    timestamps: true,
    underscored: true,
  });

  CarePointApplication.associate = (models) => {
    CarePointApplication.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
    CarePointApplication.belongsTo(models.Admin, { foreignKey: "reviewed_by", as: "reviewer" });
  };

  return CarePointApplication;
};
