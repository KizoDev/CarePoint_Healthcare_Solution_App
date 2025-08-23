// models/LearningDevelopment.js
export default (sequelize, DataTypes) => {
  const LearningDevelopment = sequelize.define("LearningDevelopment", {
    training_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    performance_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    course_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assigned_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    completion_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Assigned", "In Progress", "Completed"),
      defaultValue: "Assigned",
    },
    skills_gained: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
  }, {
    timestamps: true,
    underscored: true,
    tableName: "learning_development",
  });

  LearningDevelopment.associate = (models) => {
    LearningDevelopment.belongsTo(models.Performance, { foreignKey: "performance_id", as: "performance" });
  };

  return LearningDevelopment;
};
