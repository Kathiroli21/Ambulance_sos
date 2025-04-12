import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  vitals: {
    heartRate: Number,
    spo2: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  acceptedBy: {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    timestamp: Date
  },
  completedAt: Date,
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  notes: String
}, { timestamps: true });

alertSchema.index({ location: '2dsphere' });

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;