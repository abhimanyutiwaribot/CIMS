import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Modal, ActivityIndicator, RefreshControl, ScrollView, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from '../components/CustomAlert';
import { checkLocationPermission, getCurrentLocation } from '../utils/LocationPermission';

const INCIDENT_CATEGORIES = [
  "pothole",           // Road surface damage, holes, cracks
  "streetlight",       // Broken or non-functioning street lights
  "garbage",          // Trash, illegal dumping, waste
  "road_damage",      // General road surface issues, not potholes
  "flooding",         // Water logging, drainage issues
  "sidewalk_damage",  // Broken or damaged sidewalks
  "graffiti",         // Vandalism, unauthorized painting
  "traffic_signal",   // Traffic light issues
  "blocked_path",     // Obstructions on roads/sidewalks
  "tree_hazard"       // Fallen trees, dangerous branches
];

const analyzeImage = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'incident.jpg'
    });

    const response = await axios.post(
      'http://192.168.0.188:8000/analyze-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log('AI Analysis:', response.data);
    return response.data;
  } catch (error) {
    console.error('Image analysis failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return null;
  }
};

export default function ReportIssueScreen({ navigation }) {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [issueImage, setIssueImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [hasEvidence, setHasEvidence] = useState(null);
  const [showEvidenceAlert, setShowEvidenceAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showAnalysisAlert, setShowAnalysisAlert] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const priorities = ['Low', 'Medium', 'High'];
  const mapRef = React.useRef(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setIssueImage(result.assets[0].uri);
      setIsAnalyzing(true);
      try {
        const analysis = await analyzeImage(result.assets[0].uri);
        if (analysis) {
          setTitle(analysis.incident_type.replace('_', ' ').toUpperCase());
          setAlertConfig({
            title: 'Issue Detected',
            message: `We have detected a ${analysis.incident_type.replace('_', ' ')}. Is this correct?`,
            buttons: [
              {
                text: "Yes",
                onPress: () => {
                  const template = 
`Location Details:
[Please describe the exact location - nearby landmarks, street name, etc.
(also mark the location on the map)]

Issue Details:
- Size/Extent: [Small/Medium/Large]
- Duration: [How long has this been present?]

Safety Assessment:
[Are there any immediate risks? Yes/No]
[If yes, describe the safety concerns]

Additional Context:
[Any other important information]`;

                  setDescription(template);
                }
              },
              {
                text: "No",
                style: "cancel"
              }
            ]
          });
          setShowAnalysisAlert(true); // Set suggested priority based on confidence
          if (analysis.confidence > 80) setPriority('High');
          else if (analysis.confidence > 60) setPriority('Medium');
          else setPriority('Low');
        }
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const getLocation = async () => {
    try {
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        setAlertConfig({
          title: 'Location Required',
          message: 'Please enable location access to report issues.',
          buttons: [{ text: 'OK' }]
        });
        setShowErrorAlert(true);
        return;
      }

      const location = await getCurrentLocation();
      setLocation(location);
      
      mapRef.current?.animateToRegion({
        ...location,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'issue.jpg'
      });
      formData.append('upload_preset', 'issues');
      formData.append('cloud_name', 'dofasjf8h');

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dofasjf8h/image/upload',
        {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const data = await response.json();
      console.log('Cloudinary upload response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }

      return data.secure_url;
    } catch (error) {
      console.error('Image upload failed:', error);
      setAlertConfig({
        title: 'Error',
        message: 'Failed to upload image. Please try again.',
        buttons: [{ text: 'OK' }]
      });
      setShowErrorAlert(true);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !priority || !location) {
      setAlertConfig({
        title: 'Error',
        message: 'Please fill all fields and select a location!',
        buttons: [{ text: 'OK' }]
      });
      setShowErrorAlert(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setAlertConfig({
          title: 'Error',
          message: 'Please login again',
          buttons: [{ text: 'OK' }]
        });
        setShowErrorAlert(true);
        navigation.navigate('Login');
        return;
      }

      let imageUrl = null;
      if (issueImage) {
        imageUrl = await uploadImageToCloudinary(issueImage);
      }

      const requestData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        latitude: location.latitude,
        longitude: location.longitude,
        imageUrl
      };

      console.log("Sending request with:", {
        data: requestData,
        token: `Bearer ${token}`
      });

      const response = await axios.post(
        'http://192.168.0.188:5000/api/issues/report',
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.status === 201) {
        setAlertConfig({
          title: 'Success',
          message: 'Issue reported successfully!',
          buttons: [{
            text: 'OK',
            onPress: () => {
              setTitle('');
              setDescription('');
              setPriority('');
              setIssueImage(null);
              setLocation(null);
            }
          }]
        });
        setShowSuccessAlert(true);
      }
    } catch (error) {
      console.error('Error details:', error.response?.data || error);
      setAlertConfig({
        title: 'Error',
        message: error.response?.data?.message || 'Could not submit issue. Please try again.',
        buttons: [{ text: 'OK' }]
      });
      setShowErrorAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return theme.error;
      case 'medium': return theme.warning;
      case 'low': return theme.success;
      default: return theme.primary;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading map...</Text>
        </View>
      );
    }

    return (
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 37.7749,
          longitude: location?.longitude || -122.4194,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={(e) => setLocation(e.nativeEvent.coordinate)}
      >
        {location && (
          <Marker coordinate={location} />
        )}
      </MapView>
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Reset all fields
    setTitle('');
    setDescription('');
    setPriority('');
    setIssueImage(null);
    setLocation(null);
    setRefreshing(false);
  }, []);

  const generateDescription = () => {
    setShowEvidenceAlert(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
              progressBackgroundColor={theme.surface}
            />
          }
          contentContainerStyle={{ flexGrow: 1 }}
          style={{ flex: 1 }}
        >
          <View style={styles.contentContainer}>
            <Text style={[styles.title, { color: theme.text }]}>Report an Issue</Text>

            {/* Image Picker */}
            <TouchableOpacity 
              style={[styles.imagePickerContainer, { backgroundColor: theme.surface }]} 
              onPress={pickImage}
              disabled={isAnalyzing}
            >
              {issueImage ? (
                <>
                  <Image source={{ uri: issueImage }} style={styles.selectedImage} />
                  {isAnalyzing && (
                    <View style={styles.analyzeOverlay}>
                      <ActivityIndicator size="large" color={theme.primary} />
                      <Text style={[styles.analyzeText, { color: theme.surface }]}>Analyzing image...</Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={30} color={theme.primary} />
                  <Text style={[styles.imagePlaceholderText, { color: theme.textSecondary }]}>
                    Tap to add photo
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.surface, 
                  color: theme.text,
                  borderColor: theme.border 
                }]}
                placeholder="Issue Title"
                placeholderTextColor={theme.textSecondary}
                value={title}
                onChangeText={setTitle}
              />

              <View style={styles.descriptionContainer}>
                <View style={styles.descriptionWrapper}>
                  <TextInput
                    style={[styles.input, { 
                      height: 130, 
                      backgroundColor: theme.surface, 
                      color: theme.text,
                      borderColor: theme.border,
                      textAlignVertical: 'top',
                      paddingTop: 10,
                      fontSize: 14,
                      lineHeight: 20,
                      width: '100%', // Take full width
                    }]}
                    placeholder="Description about the issue"
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    value={description}
                    onChangeText={setDescription}
                  />
                  <TouchableOpacity 
                    onPress={generateDescription}
                    style={[styles.aiButton, { 
                      backgroundColor: 'transparent',  // Make background transparent
                      position: 'absolute',
                      top: -1,
                      right: 1,
                      elevation: 0,
                      borderWidth: 0,  // Remove border
                    }]}
                  >
                    <MaterialIcons 
                      name="auto-awesome" 
                      size={20} 
                      color={theme.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Priority Button */}
              <TouchableOpacity 
                style={[styles.priorityButton, { backgroundColor: theme.surface }]}
                onPress={() => setShowPriorityModal(true)}
              >
                <Text style={[styles.priorityButtonText, { color: theme.text }]}>
                  {priority || "Select Priority"}
                </Text>
                {priority && (
                  <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(priority) }]} />
                )}
              </TouchableOpacity>

              {/* Map */}
              <View style={styles.mapContainer}>
                {renderContent()}
                <TouchableOpacity 
                  style={[styles.locationButton, { backgroundColor: theme.primary }]}
                  onPress={getLocation}
                >
                  <MaterialIcons name="my-location" size={22} color={theme.surface} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button with transparent background */}
        <View style={[styles.submitButtonContainer, { 
          backgroundColor: 'transparent',  // Changed from theme.background
          borderTopColor: 'transparent'    // Remove top border
        }]}>
          <TouchableOpacity
            style={[styles.submitButton, { 
              backgroundColor: isSubmitting ? theme.textSecondary : theme.primary,
              marginBottom: 2  // Add some bottom margin for safety
            }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={[styles.buttonText, { color: theme.surface }]}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Priority Modal */}
        <Modal
          visible={showPriorityModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPriorityModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Priority</Text>
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityOption, { borderColor: theme.border }]}
                  onPress={() => {
                    setPriority(p);
                    setShowPriorityModal(false);
                  }}
                >
                  <Text style={[styles.priorityOptionText, { color: theme.text }]}>{p}</Text>
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(p) }]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {/* Category Selection Modal */}
        <Modal
          visible={showCategoryModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Issue Type</Text>
              {INCIDENT_CATEGORIES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.categoryOption, { borderColor: theme.border }]}
                  onPress={() => {
                    setTitle(type.replace('_', ' ').toUpperCase());
                    const template = 
`Issue Type: ${type.replace('_', ' ').toUpperCase()}

Location Details:
[Please describe the exact location - nearby landmarks, street name, etc.]

Issue Description:
[Describe what you observed]
When was this noticed?
[Today/Few days ago/etc.]

Safety Concerns:
[Are there any immediate risks? Yes/No]
[If yes, describe the risks]

Additional Information:
[Any other details that might help identify or resolve the issue]`;

                    setDescription(template);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[styles.categoryText, { color: theme.text }]}>
                    {type.replace('_', ' ').toUpperCase()}
                  </Text>
                  <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.surface }]}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={[styles.cancelText, { color: theme.primary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <CustomAlert
          visible={showEvidenceAlert}
          title="Evidence Required"
          message="Do you have any images or evidence of the issue?"
          buttons={[
            {
              text: 'Yes',
              onPress: () => {
                setHasEvidence(true);
                pickImage();
              }
            },
            {
              text: 'No',
              onPress: () => {
                setHasEvidence(false);
                setShowCategoryModal(true);
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]}
          onClose={() => setShowEvidenceAlert(false)}
        />

        <CustomAlert
          visible={showErrorAlert}
          {...alertConfig}
          onClose={() => setShowErrorAlert(false)}
        />

        <CustomAlert
          visible={showAnalysisAlert}
          {...alertConfig}
          onClose={() => setShowAnalysisAlert(false)}
        />

        <CustomAlert
          visible={showLocationAlert}
          {...alertConfig}
          onClose={() => setShowLocationAlert(false)}
        />

        <CustomAlert
          visible={showSuccessAlert}
          {...alertConfig}
          onClose={() => setShowSuccessAlert(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,

    paddingBottom: 90, 
  },
  formContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    borderRadius: 5,
  },
  map: {
    width: '100%',
    height: 200,
    marginTop: 10,
  },
  imagePickerContainer: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 5,
    fontSize: 12,
  },
  priorityButton: {
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  priorityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  mapContainer: {
    height: 220,
    marginVertical: 5,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  locationButton: {
    position: 'absolute',
    right: 10,
    top: 15,
    padding: 9,
    borderRadius: 25,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  analyzeOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'transparent', // Remove backgroundColor
    elevation: 0,           // Remove elevation
    shadowOpacity: 0,      // Remove shadow
    borderTopWidth: 0,     // Remove borderTopWidth
  },
  descriptionWrapper: {
    position: 'relative',
    width: '100%',
  },
  descriptionContainer: {
    marginBottom: 6,
  },
  aiButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 10,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});