// Sequelize model for BenefitPlan
export default (sequelize, DataTypes) => {
  const BenefitPlan = sequelize.define(
    "BenefitPlan",
    {
      benefitPlanId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100), // limit length for performance
        allowNull: false,
        unique: true, // optional: prevent duplicate plans with same name
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM("Health", "Pension", "Insurance", "Other"), // enforce strict types
        allowNull: false,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: "benefit_plans", // explicitly set table name
    }
  );

  BenefitPlan.associate = (models) => {
    BenefitPlan.hasMany(models.StaffBenefit, {
      foreignKey: "benefit_plan_id",
      as: "staffBenefits",
      onDelete: "CASCADE",
      hooks: true, // cascade safely
    });
  };

  return BenefitPlan;
};
