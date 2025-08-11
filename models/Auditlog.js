// models/AuditLog.js
export default (sequelize, DataTypes) => {
  const AuditLog = sequelize.define("AuditLog", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    module: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: false,
    underscored: true,
    tableName: "audit_logs",
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.Admin, {
      foreignKey: "admin_id",
      as: "admin",
    });
  };

  return AuditLog;
};
