// models/ShiftTemplate.js
export default (sequelize, DataTypes) => {
  const ShiftTemplate = sequelize.define("ShiftTemplate", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    client_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    day_of_week: {
      type: DataTypes.ENUM(
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ),
      allowNull: false,
    },
    recurrence: {
      type: DataTypes.ENUM("weekly", "biweekly", "monthly"),
      allowNull: false,
      defaultValue: "weekly",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
  }, {
    timestamps: true,
    underscored: true,
  });

  ShiftTemplate.associate = (models) => {
    ShiftTemplate.belongsTo(models.Client, {
      foreignKey: "client_id",
      as: "client",
    });
  };

  return ShiftTemplate;
};
