// Sequelize model for PerformanceReview
export default (sequelize, DataTypes) => {
  const PerformanceReview = sequelize.define("PerformanceReview", {
    reviewId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    review_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    timestamps: true,
    underscored: true,
  });

  PerformanceReview.associate = (models) => {
    PerformanceReview.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
    PerformanceReview.belongsTo(models.Admin, { foreignKey: "reviewer_id", as: "reviewer" });
  };

  return PerformanceReview;
};
