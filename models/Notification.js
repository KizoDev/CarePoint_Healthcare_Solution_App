
export default (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    NotificationId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("shift", "document", "general"),
      defaultValue: "general",
    },
    staffId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  }, {
    timestamps: true,
    underscored: true,
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
  };

  return Notification;
};


