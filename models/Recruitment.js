// models/Recruitment.js
export default (sequelize, DataTypes) => {
  const Recruitment = sequelize.define("Recruitment", {
    recruitment_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    job_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    applicant_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resume_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Applied", "Interview", "Offered", "Hired", "Rejected"),
      defaultValue: "Applied",
    },
    hire_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    timestamps: true,
    underscored: true,
    tableName: "recruitment",
  });

  Recruitment.associate = (models) => {
    Recruitment.belongsTo(models.Admin, { foreignKey: "admin_id", as: "handled_by" });
  };

  return Recruitment;
};
