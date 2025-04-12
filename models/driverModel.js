import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  licenseNumber: {
    type: String,
    required: true
  },
  ambulanceType: {
    type: String,
    enum: ['Basic', 'Advanced', 'MobileICU'],
    default: 'Basic'
  },
  ambulanceNumber: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentLocation: {
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
  currentAlert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  }
}, { timestamps: true });

driverSchema.index({ currentLocation: '2dsphere' });

const Driver = mongoose.model('Driver', driverSchema);

export default Driver;