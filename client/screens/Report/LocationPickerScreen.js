import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { getCurrentLocation, checkLocationPermission } from '../../utils/LocationPermission';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function LocationPickerScreen({ navigation, route }) {
  const { theme } = useTheme();
  const [location, setLocation] = useState({
    latitude: 18.9622,  // Default coordinates for Mumbai
    longitude: 72.8359,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const mapRef = useRef(null);
  const { category } = route.params;
  const loadingTimerRef = useRef(null);
  const locationLoadedRef = useRef(false);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  // Handle initial location load
  useEffect(() => {
    const initializeLocation = async () => {
      if (locationLoadedRef.current) return; // Prevent multiple loads
      
      try {
        const hasPermission = await checkLocationPermission();
        if (!hasPermission) {
          setAlertConfig({
            title: 'Location Required',
            message: 'Please enable location access to report issues.',
            buttons: [{ text: 'OK' }]
          });
          setShowAlert(true);
          return;
        }

        const currentLocation = await getCurrentLocation();
        if (currentLocation) {
          setLocation(currentLocation);
          locationLoadedRef.current = true;
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    initializeLocation();

    // Start loading timer
    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  const handleMapReady = useCallback(() => {
    setMapLoaded(true);
    if (location) {
      mapRef.current?.animateToRegion({
        ...location,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [location]);

  const getLocation = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentLocation = await getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        mapRef.current?.animateToRegion({
          ...currentLocation,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setAlertConfig({
        title: 'Error',
        message: error.message,
        buttons: [{ text: 'OK' }]
      });
      setShowAlert(true);
    } finally {
      setTimeout(() => setIsLoading(false), 2000);
    }
  }, []);

  const handleLocationSelect = (e) => {
    const newLocation = e.nativeEvent.coordinate;
    setLocation(newLocation);
  };

  const handleContinue = () => {
    if (!location) return;
    navigation.navigate('MediaPicker', { 
      category,
      location 
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
          Step 2 of 5
        </Text>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View 
            style={[
              styles.progress, 
              { 
                backgroundColor: theme.primary,
                width: '40%'
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Mark Location</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Drag the pin or tap to select the exact location
        </Text>
      </View>

      <View style={styles.mapContainer}>
        {(!mapLoaded || isLoading) && (
          <View style={[styles.mapPlaceholder, { backgroundColor: theme.surface }]}>
            <LottieView
              source={require('../../assets/animations/maploading.json')}
              autoPlay
              loop
              style={styles.loadingAnimation}
            />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Loading map...
            </Text>
          </View>
        )}
        
        {location && (
          <MapView
            ref={mapRef}
            style={[styles.map, (!mapLoaded || isLoading) && { display: 'none' }]}
            initialRegion={{
              ...location,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            onMapReady={handleMapReady}
            onPress={handleLocationSelect}
          >
            <Marker
              coordinate={location}
              draggable
              onDragEnd={(e) => handleLocationSelect(e)}
            />
          </MapView>
        )}
        
        <TouchableOpacity 
          style={[styles.locationButton, { 
            backgroundColor: theme.primary,
            opacity: isLoading ? 0.5 : 1 
          }]}
          onPress={getLocation}
          disabled={isLoading}
        >
          <MaterialIcons 
            name="my-location" 
            size={24} 
            color={theme.surface} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, { 
            backgroundColor: theme.primary,
            opacity: location ? 1 : 0.5 
          }]}
          onPress={handleContinue}
          disabled={!location}
        >
          <Text style={[styles.buttonText, { color: theme.surface }]}>Continue</Text>
          <MaterialIcons name="arrow-forward" size={24} color={theme.surface} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    zIndex: 1,
  },
  loadingAnimation: {
    width: 120,
    height: 120,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  locationButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 12,
    borderRadius: 25,
  },
  footer: {
    padding: 20,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
});
