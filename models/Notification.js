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
      type: DataTypes.ENUM("shift", "document", "general", "system", "client"),
      defaultValue: "general",
    },
    recipientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    recipientType: {
      type: DataTypes.ENUM("staff", "admin", "client"),
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    timestamps: true,
    underscored: true,
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.Staff, { foreignKey: "recipientId", constraints: false });
    Notification.belongsTo(models.Admin, { foreignKey: "recipientId", constraints: false });
    Notification.belongsTo(models.Client, { foreignKey: "recipientId", constraints: false });
  };

  return Notification;
};
