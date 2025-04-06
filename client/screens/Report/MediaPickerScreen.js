import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import CustomAlert from '../../components/CustomAlert';

export default function MediaPickerScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { category, location } = route.params;
  const [image, setImage] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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
      setShowAlert(true);
      return null;
    }
  };

  const handleContinue = async () => {
    if (image) {
      const imageUrl = await uploadImageToCloudinary(image);
      if (!imageUrl) return;
      
      navigation.navigate('IssueDetails', {
        category,
        location,
        imageUrl
      });
    } else {
      navigation.navigate('IssueDetails', {
        category,
        location
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
          Step 3 of 5
        </Text>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View style={[styles.progress, { backgroundColor: theme.primary, width: '60%' }]} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Add Photos</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Adding photos helps us better understand and address the issue
        </Text>

        <View style={styles.mediaContainer}>
          {image ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: image }} style={styles.preview} />
              <TouchableOpacity 
                style={[styles.retakeButton, { backgroundColor: theme.surface }]}
                onPress={() => setImage(null)}
              >
                <MaterialIcons name="refresh" size={24} color={theme.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.mediaButton, { backgroundColor: theme.surface }]}
                onPress={takePhoto}
              >
                <MaterialIcons name="camera-alt" size={32} color={theme.primary} />
                <Text style={[styles.buttonText, { color: theme.text }]}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.mediaButton, { backgroundColor: theme.surface }]}
                onPress={pickImage}
              >
                <MaterialIcons name="photo-library" size={32} color={theme.primary} />
                <Text style={[styles.buttonText, { color: theme.text }]}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, { backgroundColor: theme.primary }]}
          onPress={() => handleContinue()}
        >
          <Text style={[styles.continueText, { color: theme.surface }]}>Continue</Text>
          <MaterialIcons name="arrow-forward" size={24} color={theme.surface} />
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={showAlert}
        {...alertConfig}
        onClose={() => setShowAlert(false)}
      />
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    gap: 16,
  },
  mediaButton: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  previewContainer: {
    aspectRatio: 4/3,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  retakeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    borderRadius: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  continueText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
