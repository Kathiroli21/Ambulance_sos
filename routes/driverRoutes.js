import express from 'express';
import {
  updateDriverLocation,
  getAvailableDrivers,
  getDriverAlerts
} from '../controller/driverController.js';
import { protect } from '../Middlewares/authMiddleware.js';
import { roleCheck } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.put('/location', protect, roleCheck(['driver']), updateDriverLocation);
router.get('/available', getAvailableDrivers);
router.get('/alerts', protect, roleCheck(['driver']), getDriverAlerts);

export default router;