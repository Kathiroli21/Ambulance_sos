import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
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
  contactNumber: {
    type: String,
    required: true
  },
  emergencyContact: {
    type: String,
    required: true
  },
  bedsAvailable: {
    type: Number,
    default: 0
  },
  specialties: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

hospitalSchema.index({ location: '2dsphere' });

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;