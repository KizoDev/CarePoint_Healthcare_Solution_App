// models/Benefit.js
export default (sequelize, DataTypes) => {
  const Benefit = sequelize.define("Benefit", {
    benefit_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    staff_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    benefit_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Active", "Expired"),
      defaultValue: "Active",
    },
  }, {
    timestamps: true,
    underscored: true,
    tableName: "benefits",
  });

  Benefit.associate = (models) => {
    Benefit.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
  };

  return Benefit;
};
