import express from 'express';
import {
  createAdmin,
  loginAdmin,
  getAllAdmins,
  getAdminById,
  //updateAdmin,
  deleteAdmin,
} from '../controllers/adminControllers.js';
import  authMiddleware  from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.post('/register', createAdmin);
router.post('/login', loginAdmin);

// Protected routes
router.get('/', authMiddleware, getAllAdmins);
router.get('/:id', authMiddleware, getAdminById);
//router.put('/:id', authMiddleware, updateAdmin);
router.delete('/:id', authMiddleware, deleteAdmin);

export default router;
