import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/mongoDbConfig.js';

// import authRoutes from './routes/authRoutes.js';
// import healthRoutes from './routes/healthRoutes.js';
// import alertRoutes from './routes/alertRoutes.js';
// import driverRoutes from './routes/driverRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectDB();

// app.use('/api/auth', authRoutes);
// app.use('/api/health', healthRoutes);
// app.use('/api/alerts', alertRoutes);
// app.use('/api/drivers', driverRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;