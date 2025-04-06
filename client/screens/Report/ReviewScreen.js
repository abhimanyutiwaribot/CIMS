import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function ReviewScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { category, location, severity, description, firstNoticed, imageUrl } = route.params;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setAlertConfig({
          title: 'Error',
          message: 'Please login again',
          buttons: [{ text: 'OK' }]
        });
        setShowAlert(true);
        return;
      }

      const requestData = {
        title: category.title,
        description,
        priority: severity > 75 ? 'High' : severity > 50 ? 'Medium' : 'Low',
        latitude: location.latitude,
        longitude: location.longitude,
        imageUrl: imageUrl || null
      };

      const response = await axios.post(
        'http://192.168.0.194:5000/api/issues/report',
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.status === 201) {
        navigation.navigate('ReportSuccess', {
          issue: response.data
        });
      }
    } catch (error) {
      console.error('Error details:', error.response?.data || error);
      setAlertConfig({
        title: 'Error',
        message: error.response?.data?.message || 'Could not submit issue',
        buttons: [{ text: 'OK' }]
      });
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
          Step 5 of 5
        </Text>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View style={[styles.progress, { backgroundColor: theme.primary, width: '100%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Review Report</Text>

        {/* Category Info */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Issue Type</Text>
          <Text style={[styles.sectionContent, { color: theme.textSecondary }]}>
            {category.title}
          </Text>
        </View>

        {/* Location Map */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Location</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              ...location,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            scrollEnabled={false}
          >
            <Marker coordinate={location} />
          </MapView>
        </View>

        {/* Details */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Severity</Text>
            <Text style={[styles.detailContent, { color: theme.text }]}>{severity}%</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>First Noticed</Text>
            <Text style={[styles.detailContent, { color: theme.text }]}>{firstNoticed}</Text>
          </View>
          <Text style={[styles.description, { color: theme.text }]}>{description}</Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: theme.primary }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={[styles.buttonText, { color: theme.surface }]}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Text>
          <MaterialIcons name="check" size={24} color={theme.surface} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    padding: 20,
    paddingBottom: 0,
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
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
  },
  map: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailContent: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
