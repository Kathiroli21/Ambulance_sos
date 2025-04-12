import express from 'express';
import {
  getActiveAlerts,
  acceptAlert,
  completeAlert,
  getAlertDetails
} from '../controller/alertController.js';
import { protect } from "../Middlewares/authMiddleware.js";
import { roleCheck } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getActiveAlerts);

router.post('/:alertId/accept', protect, roleCheck(['driver']), acceptAlert);
router.post('/:alertId/complete', protect, roleCheck(['driver']), completeAlert);

router.get('/:alertId', protect, getAlertDetails);

export default router;