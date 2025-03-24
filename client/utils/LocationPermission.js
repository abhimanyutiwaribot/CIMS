import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkLocationPermission = async () => {
  try {
    // First check if location services are enabled
    const locationEnabled = await Location.hasServicesEnabledAsync();
    if (!locationEnabled) {
      throw new Error('Location services are disabled. Please enable location services in your device settings.');
    }

    // Then check permission status
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
    if (existingStatus !== 'granted') {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    }
    return true;
  } catch (error) {
    console.error('Error checking location:', error);
    throw error;
  }
};

export const getCurrentLocation = async () => {
  try {
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 0,
      mayShowUserSettingsDialog: true
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };
  } catch (error) {
    if (error.message.includes('Location services are disabled')) {
      throw new Error('Please enable location services in your device settings to use this feature.');
    }
    console.error('Error getting location:', error);
    throw error;
  }
};
