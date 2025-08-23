// models/CarePointApplication.js
export default (sequelize, DataTypes) => {
  const CarePointApplication = sequelize.define("CarePointApplication", {
    app_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    staff_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    application_type: {
      type: DataTypes.STRING, // e.g. Leave Request, Shift Change
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
      defaultValue: "Pending",
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: true,
    underscored: true,
    tableName: "carepoint_applications",
  });

  CarePointApplication.associate = (models) => {
    CarePointApplication.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
    CarePointApplication.belongsTo(models.Admin, { foreignKey: "approved_by", as: "admin" });
  };

  return CarePointApplication;
};
