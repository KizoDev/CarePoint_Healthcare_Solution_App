// Sequelize model for Enrollment
export default (sequelize, DataTypes) => {
  const Enrollment = sequelize.define(
    "Enrollment",
    {
      enrollmentId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      enrollment_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM("enrolled", "in_progress", "completed", "failed", "dropped"),
        defaultValue: "enrolled",
      },
      score: {
        type: DataTypes.INTEGER, // optional final score/grade
        allowNull: true,
      },
      completion_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      certificate_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  Enrollment.associate = (models) => {
    // Who is enrolled
    Enrollment.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
    // Which course they’re enrolled in
    Enrollment.belongsTo(models.LearningCourse, { foreignKey: "course_id", as: "course" });
  };

  return Enrollment;
};
