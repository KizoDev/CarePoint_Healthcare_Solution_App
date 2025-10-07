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
    employment_type: {
      type: DataTypes.STRING, // e.g., Full-time, Part-time, Contract
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    salary_range: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("open", "closed", "paused"),
      allowNull: false,
      defaultValue: "open",
    },
  }, {
    timestamps: true,
    underscored: true,
    tableName: "job_postings",
  });

  JobPosting.associate = (models) => {
    JobPosting.hasMany(models.JobApplication, {
      foreignKey: "job_id",
      as: "applications",
    });
    JobPosting.belongsTo(models.Admin, {
      foreignKey: "admin_id",
      as: "admin",
    });
  };

  return JobPosting;
};
