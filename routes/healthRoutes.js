import express from 'express';
import { 
  processVitals,
  getPatientVitals
} from '../controller/heathContoller.js';
import { protect } from '../Middlewares/authMiddleware.js';
import { roleCheck } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.post('/vitals', processVitals);

router.get('/vitals', protect, roleCheck(['patient']), getPatientVitals);

export default router;