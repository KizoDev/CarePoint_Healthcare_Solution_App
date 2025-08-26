// Sequelize model for StaffBenefit
export default (sequelize, DataTypes) => {
  const StaffBenefit = sequelize.define("StaffBenefit", {
    staffBenefitId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    enrollment_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.STRING, // active, expired, pending
      defaultValue: "active",
    },
  }, {
    timestamps: true,
    underscored: true,
  });

  StaffBenefit.associate = (models) => {
    StaffBenefit.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
    StaffBenefit.belongsTo(models.BenefitPlan, { foreignKey: "benefit_plan_id", as: "benefitPlan" });
  };

  return StaffBenefit;
};
