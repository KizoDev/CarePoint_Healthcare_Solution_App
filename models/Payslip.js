// models/Payslip.js
export default (sequelize, DataTypes) => {
  const Payslip = sequelize.define("Payslip", {
    payslipId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    payrollRunId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    staffId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    basic_salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    allowances: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    overtime: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    deductions: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    net_pay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    issued_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
