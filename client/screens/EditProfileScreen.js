import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  Image, ActivityIndicator, ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/CustomAlert';

export default function EditProfileScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { currentUser } = route.params;
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [profileImage, setProfileImage] = useState(currentUser?.profilePic);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg'
      });
      formData.append('upload_preset', 'profilepicture');

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dofasjf8h/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const handleUpdate = async () => {
    if (!fullName.trim()) {
      setAlertConfig({
        title: 'Error',
        message: 'Please enter your name',
        buttons: [{ text: 'OK' }]
      });
      setShowAlert(true);
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = profileImage;
      if (profileImage !== currentUser?.profilePic) {
        imageUrl = await uploadImageToCloudinary(profileImage);
      }

      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.patch(
        'http://192.168.0.188:5000/api/user/profile',
        {
          fullName,
          profilePic: imageUrl
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAlertConfig({
        title: 'Success',
        message: 'Profile updated successfully',
        buttons: [{
          text: 'OK',
          onPress: () => navigation.goBack()
        }]
      });
      setShowAlert(true);
    } catch (error) {
      setAlertConfig({
        title: 'Error',
        message: 'Failed to update profile',
        buttons: [{ text: 'OK' }]
      });
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: theme.surface }]}
          >
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Edit Profile
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.imageContainer} 
          onPress={pickImage}
        >
          {profileImage ? (
            <Image 
              source={{ uri: profileImage }} 
              style={styles.profileImage} 
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.surface }]}>
              <Ionicons name="person" size={40} color={theme.textSecondary} />
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
            <Ionicons name="camera" size={14} color={theme.surface} />
          </View>
        </TouchableOpacity>

        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Full Name
          </Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border
              }
            ]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <TouchableOpacity
          style={[styles.updateButton, { backgroundColor: theme.primary }]}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.surface} />
          ) : (
            <Text style={[styles.updateButtonText, { color: theme.surface }]}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  updateButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
