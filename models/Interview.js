// Sequelize model for Interview
export default (sequelize, DataTypes) => {
  const Interview = sequelize.define("Interview", {
    interviewId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    applicationId:{
      type: DataTypes.UUID,
      allowNull: false,
    },
    interviewer_staff_id:{
      type: DataTypes.UUID,
      allowNull: false,
    },
    scheduled_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  status: {
  type: DataTypes.ENUM(
    "scheduled",  
    "rescheduled", 
    "completed",  
    "cancelled",   ),
  defaultValue: "scheduled",
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
