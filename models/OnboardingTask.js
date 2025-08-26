// Sequelize model for OnboardingTask
export default (sequelize, DataTypes) => {
  const OnboardingTask = sequelize.define("OnboardingTask", {
    taskId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING, // pending, completed
      defaultValue: "pending",
    },
  }, {
    timestamps: true,
    underscored: true,
  });

  OnboardingTask.associate = (models) => {
    OnboardingTask.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
  };

  return OnboardingTask;
};
