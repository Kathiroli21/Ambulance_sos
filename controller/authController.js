import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import { generateToken } from '../utils/generateToken.js';
import Patient from '../models/patientModel.js';
import Hospital from '../models/hospitalModel.js';
import Driver from '../models/driverModel.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role
    });
    
    if (role === 'patient') {
      await Patient.create({ user: user._id });
    } else if (role === 'hospital') {
      await Hospital.create({ user: user._id });
    } else if (role === 'driver') {
      await Driver.create({ user: user._id });
    }
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    let profile = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ user: user._id }).populate('user');
    } else if (user.role === 'hospital') {
      profile = await Hospital.findOne({ user: user._id }).populate('user');
    } else if (user.role === 'driver') {
      profile = await Driver.findOne({ user: user._id }).populate('user');
    }
    
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { name, phone, fcmToken } = req.body;
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (fcmToken) user.fcmToken = fcmToken;
    
    await user.save();
    
    let profile;
    if (user.role === 'patient') {
      profile = await Patient.findOneAndUpdate(
        { user: user._id },
        req.body.patientData || {},
        { new: true }
      ).populate('user');
    } else if (user.role === 'hospital') {
      profile = await Hospital.findOneAndUpdate(
        { user: user._id },
        req.body.hospitalData || {},
        { new: true }
      ).populate('user');
    } else if (user.role === 'driver') {
      profile = await Driver.findOneAndUpdate(
        { user: user._id },
        req.body.driverData || {},
        { new: true }
      ).populate('user')
    }
    
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
