import Alert from '../models/alertModel.js';
import Driver from '../models/driverModel.js';
import Hospital from '../models/hospitalModel.js';
import { calculateRouteAndETA, getDistance, getRouteProgress } from '../utils/geoUtils.js';
import { getIO } from '../socket/index.js';


export const getActiveAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ status: 'pending' })
      .populate('patient')
      .sort({ createdAt: -1 });
    
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptAlert = async (req, res) => {
  try {
    const io = getIO();

    const { alertId } = req.params;
    const { hospitalId } = req.body;
    
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    if (alert.status !== 'pending') {
      return res.status(400).json({ message: 'Alert already accepted' });
    }
    
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(403).json({ message: 'Only drivers can accept alerts' });
    }
    
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    
    
    const { route, distance, duration } = await calculateRouteAndETA(
      driver.currentLocation.coordinates,
      alert.location.coordinates
    );
    
    
    alert.status = 'accepted';
    alert.acceptedBy = {
      driver: driver._id,
      hospital: hospital._id,
      timestamp: new Date()
    };
    alert.tracking = {
      updates: [{
        location: driver.currentLocation,
        timestamp: new Date(),
        status: 'enroute',
        estimatedArrival: duration,
        distance: distance
      }],
      route: route.map(coord => ({
        type: 'Point',
        coordinates: coord
      }))
    };
    await alert.save();
    
    
    driver.isAvailable = false;
    driver.currentAlert = alert._id;
    await driver.save();
    
    
    io.emit('alertAccepted', {
      alertId: alert._id,
      driverId: driver._id,
      hospitalId: hospital._id,
      tracking: alert.tracking
    });
    
    res.status(200).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDriverLocation = async (req, res) => {
  try {
    const io = getIO();

    const { alertId } = req.params;
    const { longitude, latitude } = req.body;
    
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(403).json({ message: 'Driver not found' });
    }
    
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    if (!alert.acceptedBy.driver.equals(driver._id)) {
      return res.status(403).json({ message: 'Not authorized for this alert' });
    }
    
    const newLocation = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
    driver.currentLocation = newLocation;
    await driver.save();
    
    let status = 'enroute';
    const distanceToPatient = getDistance(
      [longitude, latitude],
      alert.location.coordinates
    );
    
    if (distanceToPatient < 50) { 
      status = 'arrived';
    }
    
    const { closestIndex, minDistance } = getRouteProgress(
      [longitude, latitude],
      alert.tracking.route
    );
    
    let remainingDistance = 0;
    for (let i = closestIndex; i < alert.tracking.route.length - 1; i++) {
      remainingDistance += getDistance(
        alert.tracking.route[i].coordinates,
        alert.tracking.route[i+1].coordinates
      );
    }
    
    const estimatedArrival = Math.ceil((remainingDistance / 1000) / 40 * 60); 
    
    alert.tracking.updates.push({
      location: newLocation,
      timestamp: new Date(),
      status,
      estimatedArrival,
      distance: distanceToPatient
    });
    
    await alert.save();
    
    io.emit('driverLocationUpdate', {
      alertId: alert._id,
      location: newLocation,
      status,
      estimatedArrival,
      distance: distanceToPatient
    });
    
    res.status(200).json({
      message: 'Location updated',
      status,
      estimatedArrival,
      distance: distanceToPatient
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const startTransport = async (req, res) => {
  try {
    const { alertId } = req.params;
    
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(403).json({ message: 'Driver not found' });
    }
    
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    if (!alert.acceptedBy.driver.equals(driver._id)) {
      return res.status(403).json({ message: 'Not authorized for this alert' });
    }
    
    const hospital = await Hospital.findById(alert.acceptedBy.hospital);
    const { route, distance, duration } = await calculateRouteAndETA(
      alert.location.coordinates,
      hospital.location.coordinates
    );
    
    alert.tracking.updates.push({
      location: driver.currentLocation,
      timestamp: new Date(),
      status: 'transporting',
      estimatedArrival: duration,
      distance
    });
    
    await alert.save();
    
    // Notify all clients
    io.emit('transportStarted', {
      alertId: alert._id,
      route: route.map(coord => ({
        type: 'Point',
        coordinates: coord
      })),
      estimatedArrival: duration
    });
    
    res.status(200).json({
      message: 'Transport started',
      estimatedArrival: duration
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    if (alert.status !== 'accepted') {
      return res.status(400).json({ message: 'Alert not in accepted state' });
    }
    
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver || !driver.currentAlert.equals(alert._id)) {
      return res.status(403).json({ message: 'Only assigned driver can complete alert' });
    }
    
    // Update alert
    alert.status = 'completed';
    alert.completedAt = new Date();
    alert.tracking.updates.push({
      location: driver.currentLocation,
      timestamp: new Date(),
      status: 'completed',
      estimatedArrival: 0,
      distance: 0
    });
    await alert.save();
    
    driver.isAvailable = true;
    driver.currentAlert = undefined;
    await driver.save();
    
    io.emit('alertCompleted', {
      alertId: alert._id
    });
    
    res.status(200).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAlertDetails = async (req, res) => {
  try {
    const { alertId } = req.params;
    
    const alert = await Alert.findById(alertId)
      .populate('patient')
      .populate('acceptedBy.driver')
      .populate('acceptedBy.hospital');
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.status(200).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};