import mongoose from 'mongoose';


const driverSchema = new mongoose.Schema({
    name: String,
    isAvailable: { type: Boolean, default: true },
    location: {
      latitude: Number,
      longitude: Number
    }
  });
  export default mongoose.model('Driver', driverSchema);
  