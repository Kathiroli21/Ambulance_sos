import mongoose from 'mongoose';
const hospitalSchema = new mongoose.Schema({
    name: String,
    address: String,
    location: {
      latitude: Number,
      longitude: Number
    }
  });
  export default mongoose.model('Hospital', hospitalSchema);
  