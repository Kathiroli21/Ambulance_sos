import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient', 'hospital', 'driver'],
    required: true
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  fcmToken: {
    type: String
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;