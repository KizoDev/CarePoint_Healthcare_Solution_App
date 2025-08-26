// Sequelize model for PayrollRun
export default (sequelize, DataTypes) => {
  const PayrollRun = sequelize.define("PayrollRun", {
    payrollRunId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    period_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    period_end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    processed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: true,
    underscored: true,
  });

  PayrollRun.associate = (models) => {
    PayrollRun.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
    PayrollRun.hasMany(models.Payslip, { foreignKey: "payroll_run_id", as: "payslips" });
  };

  return PayrollRun;
};
