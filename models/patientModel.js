import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicalHistory: {
    type: String,
    default: ''
  },
  currentMedications: {
    type: String,
    default: ''
  },
  emergencyContacts: [{
    name: String,
    phone: String,
    relationship: String
  }],
  smartWatchDeviceId: {
    type: String,
    unique: true
  },
  thresholdSettings: {
    heartRate: {
      min: { type: Number, default: 60 },
      max: { type: Number, default: 100 }
    },
    spo2: {
      min: { type: Number, default: 95 }
    },
    bloodPressure: {
      systolic: {
        min: { type: Number, default: 90 },
        max: { type: Number, default: 120 }
      },
      diastolic: {
        min: { type: Number, default: 60 },
        max: { type: Number, default: 80 }
      }
    }
  }
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;