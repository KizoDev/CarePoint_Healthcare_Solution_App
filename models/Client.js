// Sequelize model for Client
export default (sequelize, DataTypes) => {
  const Client = sequelize.define("Client", {
    ClientId: {
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
    contact_info: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: { type: DataTypes.ENUM("Discharged", "Under Treatment", "Deceased"),
    defaultValue: "Under Treatment" 
    },
 
   careLevel: { type: DataTypes.ENUM("high", "low","critical"),
    defaultValue: "high" },
  }, 
   {
    timestamps: true,
    underscored: true,
  });

  Client.associate = (models) => {
    Client.hasMany(models.Shift, { foreignKey: "client_id", as: "shifts" });
  };
   Client.associate = (models) => {
    Client.belongsTo(models.Admin, {
      foreignKey: "admin_id",
      as: "admin",
    });
  };

  return Client;
};
