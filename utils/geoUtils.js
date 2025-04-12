export const findNearbyHospitals = async (location, maxDistance = 5000) => {
    const Hospital = (await import('../models/hospitalModel.js')).default;
    
    return Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: location
          },
          $maxDistance: maxDistance
        }
      },
      isActive: true
    });
  };
  
  export const findNearbyDrivers = async (location, maxDistance = 5000) => {
    const Driver = (await import('../models/driverModel.js')).default;
    
    return Driver.find({
      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: location
          },
          $maxDistance: maxDistance
        }
      },
      isAvailable: true
    }).populate('user');
  };