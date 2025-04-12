import authRoutes from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import driverRoutes from './routes/driverRoutes.js';

export const routing = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/health', healthRoutes);
  app.use('/api/alerts', alertRoutes);
  app.use('/api/drivers', driverRoutes);

};
