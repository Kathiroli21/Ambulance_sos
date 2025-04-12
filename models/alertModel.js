import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    patientId: mongoose.Schema.Types.ObjectId,
    hospitalId: mongoose.Schema.Types.ObjectId,
    driverId: mongoose.Schema.Types.ObjectId,
    status: { type: String, enum: ['active', 'accepted', 'cancelled'], default: 'active' }
  });
  export default mongoose.model('Alert', alertSchema);