// Sequelize model for StaffBenefit
export default (sequelize, DataTypes) => {
  const StaffBenefit = sequelize.define(
    "StaffBenefit",
    {
      staffBenefitId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      staff_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      benefit_plan_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      enrollment_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM("active", "expired", "pending"), // enforce valid values
        defaultValue: "active",
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: "staff_benefits", // explicit table name
    }
  );

  StaffBenefit.associate = (models) => {
    StaffBenefit.belongsTo(models.Staff, {
      foreignKey: "staff_id",
      as: "staff",
      onDelete: "CASCADE",
    });
    StaffBenefit.belongsTo(models.BenefitPlan, {
      foreignKey: "benefit_plan_id",
      as: "benefitPlan",
      onDelete: "CASCADE",
    });
  };

  return StaffBenefit;
};
