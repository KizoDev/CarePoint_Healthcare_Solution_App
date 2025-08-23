// models/Performance.js
export default (sequelize, DataTypes) => {
  const Performance = sequelize.define("Performance", {
    performance_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    staff_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    review_period: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    appraisal_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    timestamps: true,
    underscored: true,
    tableName: "performance",
  });

  Performance.associate = (models) => {
    Performance.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
    Performance.hasMany(models.LearningDevelopment, { foreignKey: "performance_id", as: "trainings" });
  };

  return Performance;
};
