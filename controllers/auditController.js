// controllers/auditController.js
import db from '../models/index.js';
import { Op } from 'sequelize';

const { AuditLog, Admin } = db;

// GET /api/audit-logs
// Query params: user (admin_id), module, action, startDate, endDate, page, limit
export const getAuditLogs = async (req, res) => {
  try {
    const {
      user,         // admin_id
      module,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Number.parseInt(page, 10) || 1;
    const limitNum = Number.parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    const where = {};

    if (user) where.admin_id = user;

    // Optional: case-insensitive filtering (Postgres)
    if (module) where.module = { [Op.iLike]: `%${module}%` };
    if (action) where.action = { [Op.iLike]: `%${action}%` };

    // Date filters
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && !isNaN(start.getTime()) && end && !isNaN(end.getTime())) {
      where.timestamp = { [Op.between]: [start, end] };
    } else if (start && !isNaN(start.getTime())) {
      where.timestamp = { [Op.gte]: start };
    } else if (end && !isNaN(end.getTime())) {
      where.timestamp = { [Op.lte]: end };
    }

    const logs = await AuditLog.findAndCountAll({
      where,
      include: [
        {
          model: Admin,
          as: 'admin',
          attributes: [
            'AdminId',
            'name',
            'email',
            'role',
          ],
        },
      ],
      order: [['timestamp', 'DESC']],
      limit: limitNum,
      offset,
    });

    return res.status(200).json({
      total: logs.count,
      page: pageNum,
      pages: Math.ceil(logs.count / limitNum),
      data: logs.rows,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({ message: 'Failed to fetch audit logs',
     error:error.message });
  }
};
