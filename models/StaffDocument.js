export default (sequelize, DataTypes) => {
  const StaffDocument = sequelize.define("StaffDocument", {
    staffDocumentId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    staffId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    document_type: { type: DataTypes.STRING, allowNull: false },
    file_url: { type: DataTypes.STRING, allowNull: false },
    expiry_date: { type: DataTypes.DATE, allowNull: false },
  }, {
    timestamps: true,
    underscored: true,
  });

  StaffDocument.associate = (models) => {
    StaffDocument.belongsTo(models.Staff, {
      foreignKey: "staffId",
      as: "staff",
    });
  };

  return StaffDocument;
};
