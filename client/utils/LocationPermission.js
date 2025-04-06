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
      accuracy: Location.Accuracy.Balanced, // Changed from High to Balanced
      timeout: 15000, // 15 second timeout
    });

    if (!location) {
      throw new Error('Could not get location');
    }

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('getCurrentLocation error:', error);
    throw new Error('Failed to get current location');
  }
};
