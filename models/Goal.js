// Sequelize model for Goal
export default (sequelize, DataTypes) => {
  const Goal = sequelize.define("Goal", {
    goalId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    target_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING, // in_progress, achieved, failed
      defaultValue: "in_progress",
    },
  }, {
    timestamps: true,
    underscored: true,
  });

  Goal.associate = (models) => {
    Goal.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
  };

  return Goal;
};
