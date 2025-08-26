// Sequelize model for Interview
export default (sequelize, DataTypes) => {
  const Interview = sequelize.define("Interview", {
    interviewId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    scheduled_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    result: {
      type: DataTypes.STRING, // passed, failed, pending
      defaultValue: "pending",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    timestamps: true,
    underscored: true,
  });

  Interview.associate = (models) => {
    Interview.belongsTo(models.JobApplication, { foreignKey: "application_id", as: "application" });
    Interview.belongsTo(models.Admin, { foreignKey: "interviewer_id", as: "interviewer" });
  };

  return Interview;
};
