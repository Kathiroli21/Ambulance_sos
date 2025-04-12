import Driver from '../models/driverModel.js';
import User from '../models/userModel.js';
import  Alert from "../models/alertModel.js"

export const updateDriverLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;
    
    const driver = await Driver.findOneAndUpdate(
      { user: req.user.id },
      {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      },
      { new: true }
    ).populate('user');
    
    res.status(200).json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ isAvailable: true }).populate('user');
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDriverAlerts = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    const alerts = await Alert.find({
      'acceptedBy.driver': driver._id
    }).populate('patient');
    
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};