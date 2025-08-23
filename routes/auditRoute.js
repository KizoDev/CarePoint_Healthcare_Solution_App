// routes/auditRoutes.js
import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();
router.get('/', authMiddleware, roleMiddleware('super_admin'), getAuditLogs);
export default router;
