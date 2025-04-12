import mongoose from 'mongoose';
const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  location: {
    latitude: Number,
    longitude: Number
  },
  healthData: {
    heartRate: Number,
    spo2: Number,
    bp: String
  }
}, { timestamps: true });
export default mongoose.model('Patient', patientSchema);
