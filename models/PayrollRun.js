// models/PayrollRun.js
export default (sequelize, DataTypes) => {
  const PayrollRun = sequelize.define(
    "PayrollRun",
    {
      payrollRunId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
        
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    
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
      status: {
        type: DataTypes.ENUM("draft", "processed", "closed"),
        defaultValue: "draft",
      },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  PayrollRun.associate = (models) => {
    PayrollRun.hasMany(models.Payslip, {
      foreignKey: "payroll_run_id",
      as: "payslips",
    });
  };

  return PayrollRun;
};
