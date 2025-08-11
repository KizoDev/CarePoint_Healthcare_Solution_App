export default (sequelize, DataTypes) => {
  const Staff = sequelize.define("Staff", {
    StaffId: {
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
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("Nurse", "HCA", "SW", "SHCA", "SSW"),
      allowNull: false,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    Can_access_mobile_app: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [
        {
          label: 'Access_mobile_App',
          Access: true,
        },
      ]
    }
  }, {
    timestamps: true,
    underscored: true,
  });

  Staff.associate = (models) => {
    Staff.hasMany(models.StaffDocument, { foreignKey: "staff_id", as: "documents" });
    Staff.hasMany(models.Shift, { foreignKey: "staff_id", as: "assignedShifts" });
  };

  return Staff;
};
