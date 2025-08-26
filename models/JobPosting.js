// Sequelize model for JobPosting
export default (sequelize, DataTypes) => {
  const JobPosting = sequelize.define("JobPosting", {
    jobId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING, // open, closed
      defaultValue: "open",
    },
  }, {
    timestamps: true,
    underscored: true,
  });

  JobPosting.associate = (models) => {
    JobPosting.hasMany(models.JobApplication, { foreignKey: "job_id", as: "applications" });
  };

  return JobPosting;
};
