import Patient from '../models/Patient.js';
import Alert from '../models/Alert.js';
import { checkVitalThresholds, determineSeverity } from '../utils/thresholds.js';
import { findNearbyHospitals, findNearbyDrivers } from '../utils/geoUtils.js';
import User from '../models/User.js';
import { io } from '../socket/index.js';

export const processVitals = async (req, res) => {
  try {
    const { deviceId, vitals, location } = req.body;
    
    const patient = await Patient.findOne({ smartWatchDeviceId: deviceId }).populate('user');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const alerts = checkVitalThresholds(vitals, patient.thresholdSettings);
    
    if (alerts.length > 0) {
      const severity = determineSeverity(alerts);
      
      const alert = await Alert.create({
        patient: patient._id,
        vitals,
        location: {
          type: 'Point',
          coordinates: location
        },
        severity,
        status: 'pending'
      });
      
      const [hospitals, drivers] = await Promise.all([
        findNearbyHospitals(location),
        findNearbyDrivers(location)
      ]);
      
      io.emit('newAlert', {
        alert,
        patient,
        hospitals,
        drivers
      });
      
      
      return res.status(200).json({ 
        message: 'Alert created', 
        alert,
        severity
      });
    }
    
    res.status(200).json({ message: 'Vitals normal' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientVitals = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const alerts = await Alert.find({ patient: patient._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
