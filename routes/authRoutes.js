import express from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile
} from '../controller/authController.js';
import { protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile_update', protect, updateProfile);

export default router;