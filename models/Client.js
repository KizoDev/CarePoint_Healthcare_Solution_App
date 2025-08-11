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
    contact_info: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    timestamps: true,
    underscored: true,
  });

  Client.associate = (models) => {
    Client.hasMany(models.Shift, { foreignKey: "client_id", as: "shifts" });
  };

  return Client;
};
