// models/Admin.js
export default (sequelize, DataTypes) => {
  const Admin = sequelize.define("Admin", {
    AdminId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(
        "Super_admin",
        "Scheduler_admin",
        "Authorization_admin"
      ),
      allowNull: false,
    },
  }, {
    timestamps: true,
    underscored: true,
  });

  Admin.associate = (models) => {
    Admin.hasMany(models.Shift, {
      foreignKey: "created_by",
      as: "createdShifts",
    });
    Admin.hasMany(models.Staff, {
      foreignKey: "created_by",
      as: "createdStaff",
    });
    Admin.hasMany(models.Client, {
      foreignKey: "created_by",
      as: "createdClients",
    });
    Admin.hasMany(models.AuditLog, {
      foreignKey: "admin_id",
      as: "auditLogs",
    });
    Admin.hasMany(models.Notification, {
      foreignKey: "created_by",
      as: "createdNotifications",
    });
  };

  return Admin;
};
