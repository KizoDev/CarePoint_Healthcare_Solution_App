// Sequelize model for Payslip
export default (sequelize, DataTypes) => {
  const Payslip = sequelize.define("Payslip", {
    payslipId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    gross_pay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    deductions: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    net_pay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    issued_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: true,
    underscored: true,
  });

  Payslip.associate = (models) => {
    Payslip.belongsTo(models.PayrollRun, { foreignKey: "payroll_run_id", as: "payrollRun" });
    Payslip.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
  };

  return Payslip;
};
