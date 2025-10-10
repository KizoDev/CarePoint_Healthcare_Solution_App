// Sequelize model for JobApplication
export default (sequelize, DataTypes) => {
  const JobApplication = sequelize.define("JobApplication", {
    applicationId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    jobId:{
      type: DataTypes.UUID,
      allowNull: false,
    },
    candidate_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resume_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
  type: DataTypes.ENUM("applied", "shortlisted", "interview_scheduled", "hired", "rejected"),
  allowNull: false,
  defaultValue: "applied",
  },

  }, {
    timestamps: true,
    underscored: true,
  });

  JobApplication.associate = (models) => {
    JobApplication.belongsTo(models.JobPosting, { foreignKey: "job_id", as: "jobPosting" });
    JobApplication.hasMany(models.Interview, { foreignKey: "application_id", as: "interviews" });
  };

  return JobApplication;
};
