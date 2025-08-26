// Sequelize model for BenefitPlan
export default (sequelize, DataTypes) => {
  const BenefitPlan = sequelize.define("BenefitPlan", {
    benefitPlanId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING, // e.g., Health, Pension, Insurance
      allowNull: false,
    },
  }, {
    timestamps: true,
    underscored: true,
  });

  BenefitPlan.associate = (models) => {
    BenefitPlan.hasMany(models.StaffBenefit, { foreignKey: "benefit_plan_id", as: "staffBenefits" });
  };

  return BenefitPlan;
};
