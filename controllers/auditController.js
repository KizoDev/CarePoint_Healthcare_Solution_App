import db from '../models/index.js';

const { AuditLog, Admin } = db;

// GET all logs with optional filters
export const getAuditLogs = async (req, res) => {
  try {
    const { user, module, action, startDate, endDate, page = 1, limit = 10 } = req.query;

    const where = {};
    if (user) where.admin_id = user;
    if (module) where.module = module;
    if (action) where.action = action;
    if (startDate && endDate) {
      where.timestamp = {
        [db.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const offset = (page - 1) * limit;

    const logs = await AuditLog.findAndCountAll({
      where,
      include: [{ model: Admin, as: 'admin', attributes: ['id', 'name', 'email'] }],
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      total: logs.count,
      page: parseInt(page),
      pages: Math.ceil(logs.count / limit),
      data: logs.rows,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};
