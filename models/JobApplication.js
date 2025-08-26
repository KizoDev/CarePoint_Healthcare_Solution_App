// Sequelize model for JobApplication
export default (sequelize, DataTypes) => {
  const JobApplication = sequelize.define("JobApplication", {
    applicationId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
      type: DataTypes.STRING, // applied, shortlisted, interviewed, hired, rejected
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
