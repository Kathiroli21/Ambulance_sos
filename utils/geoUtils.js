import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

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

export const calculateRouteAndETA = async (start, end) => {
  try {
    
    const response = await axios.get('https://api.openrouteservice.org/v2/directions/driving-car', {
      params: {
        api_key: process.env.OPENROUTE_API_KEY,
        start: `${start[0]},${start[1]}`,
        end: `${end[0]},${end[1]}`
      },
      headers: {
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
      }
    });
    
    const route = response.data.features[0].geometry.coordinates;
    const distance = response.data.features[0].properties.segments[0].distance; 
    const duration = response.data.features[0].properties.segments[0].duration; 
    
    return {
      route,
      distance,
      duration: Math.ceil(duration / 60) 
    };
  } catch (error) {
    console.error('Routing error:', error);

    const distance = getDistance(start, end);
    const duration = Math.ceil((distance / 1000) / 40 * 60); 
    
    return {
      route: [start, end],
      distance,
      duration
    };
  }
};

export const getDistance = (coord1, coord2) => {
  const R = 6371e3; 
  const φ1 = coord1[1] * Math.PI/180;
  const φ2 = coord2[1] * Math.PI/180;
  const Δφ = (coord2[1]-coord1[1]) * Math.PI/180;
  const Δλ = (coord2[0]-coord1[0]) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

export const getRouteProgress = (currentLocation, route) => {
  let closestPoint = route[0];
  let minDistance = Infinity;
  let closestIndex = 0;

  for (let i = 0; i < route.length; i++) {
    const point = route[i];
    const distance = getDistance(currentLocation, point.coordinates);
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = point;
      closestIndex = i;
    }
  }

  return {
    closestPoint,
    closestIndex,
    minDistance
  };
};