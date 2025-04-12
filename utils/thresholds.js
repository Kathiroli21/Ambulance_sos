export const checkVitalThresholds = (vitals, patientThresholds) => {
    const alerts = [];
    
    if (vitals.heartRate < patientThresholds.heartRate.min) {
      alerts.push({
        type: 'heartRate',
        value: vitals.heartRate,
        threshold: patientThresholds.heartRate.min,
        condition: 'low'
      });
    } else if (vitals.heartRate > patientThresholds.heartRate.max) {
      alerts.push({
        type: 'heartRate',
        value: vitals.heartRate,
        threshold: patientThresholds.heartRate.max,
        condition: 'high'
      });
    }
    
    if (vitals.spo2 < patientThresholds.spo2.min) {
      alerts.push({
        type: 'spo2',
        value: vitals.spo2,
        threshold: patientThresholds.spo2.min,
        condition: 'low'
      });
    }
    
    if (vitals.bloodPressure.systolic < patientThresholds.bloodPressure.systolic.min) {
      alerts.push({
        type: 'bloodPressure',
        value: vitals.bloodPressure.systolic,
        threshold: patientThresholds.bloodPressure.systolic.min,
        condition: 'low',
        component: 'systolic'
      });
    } else if (vitals.bloodPressure.systolic > patientThresholds.bloodPressure.systolic.max) {
      alerts.push({
        type: 'bloodPressure',
        value: vitals.bloodPressure.systolic,
        threshold: patientThresholds.bloodPressure.systolic.max,
        condition: 'high',
        component: 'systolic'
      });
    }
    
    if (vitals.bloodPressure.diastolic < patientThresholds.bloodPressure.diastolic.min) {
      alerts.push({
        type: 'bloodPressure',
        value: vitals.bloodPressure.diastolic,
        threshold: patientThresholds.bloodPressure.diastolic.min,
        condition: 'low',
        component: 'diastolic'
      });
    } else if (vitals.bloodPressure.diastolic > patientThresholds.bloodPressure.diastolic.max) {
      alerts.push({
        type: 'bloodPressure',
        value: vitals.bloodPressure.diastolic,
        threshold: patientThresholds.bloodPressure.diastolic.max,
        condition: 'high',
        component: 'diastolic'
      });
    }
    
    return alerts;
  };
  
  export const determineSeverity = (alerts) => {
    const criticalCount = alerts.filter(alert => 
      (alert.type === 'spo2' && alert.value < 90) ||
      (alert.type === 'heartRate' && (alert.value < 50 || alert.value > 140)) ||
      (alert.type === 'bloodPressure' && alert.component === 'systolic' && (alert.value < 80 || alert.value > 180))
    ).length;
    
    if (criticalCount > 0) return 'critical';
    
    const highCount = alerts.filter(alert => 
      (alert.type === 'spo2' && alert.value < 93) ||
      (alert.type === 'heartRate' && (alert.value < 55 || alert.value > 120)) ||
      (alert.type === 'bloodPressure' && alert.component === 'systolic' && (alert.value < 85 || alert.value > 160))
    ).length;
    
    if (highCount > 0) return 'high';
    
    return alerts.length > 0 ? 'medium' : 'low';
  };