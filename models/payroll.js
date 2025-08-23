// models/Payroll.js
export default (sequelize, DataTypes) => {
  const Payroll = sequelize.define("Payroll", {
    payroll_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    staff_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    salary: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    deductions: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    taxes: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    net_pay: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    pay_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    payslip_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    timestamps: true,
    underscored: true,
    tableName: "payrolls",
  });

  Payroll.associate = (models) => {
    Payroll.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
  };

  return Payroll;
};
