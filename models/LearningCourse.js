// Sequelize model for LearningCourse
export default (sequelize, DataTypes) => {
  const LearningCourse = sequelize.define(
    "LearningCourse",
    {
      courseId: {
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
        allowNull: true,
      },
      provider: {
        type: DataTypes.STRING, // e.g., in-house, Coursera, Udemy
        allowNull: true,
      },
      mode: {
        type: DataTypes.ENUM("online", "in_person", "hybrid"),
        defaultValue: "online",
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      duration_hours: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING, // e.g., compliance, clinical, soft_skills
        allowNull: true,
      },
      certificate_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  LearningCourse.associate = (models) => {
    // Enrollments into this course
    LearningCourse.hasMany(models.Enrollment, {
      foreignKey: "course_id",
      as: "enrollments",
    });
  };

  return LearningCourse;
};
