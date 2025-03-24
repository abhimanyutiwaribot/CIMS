import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard
} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomAlert from '../components/CustomAlert';

export default function SignupScreen({ navigation }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    const formData = new FormData();
    formData.append('file', { uri: imageUri, name: 'profile.jpg', type: 'image/jpeg' });
    formData.append('upload_preset', 'profilepicture');
    formData.append('cloud_name', 'dofasjf8h'); 

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dofasjf8h/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log(data);
      return data.secure_url;
    } catch (error) {
      console.error('Image upload failed:', error);
      Alert.alert(error)
      return null;
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      setAlertConfig({
        title: 'Error',
        message: 'All fields are required.',
        buttons: [{ text: 'OK' }]
      });
      setShowErrorAlert(true);
      return;
    }
    if (!validateEmail(email)) {
      setAlertConfig({
        title: 'Error',
        message: 'Please enter a valid email address.',
        buttons: [{ text: 'OK' }]
      });
      setShowErrorAlert(true);
      return;
    }
    if (password.length < 6) {
      setAlertConfig({
        title: 'Error',
        message: 'Password must be at least 6 characters long.',
        buttons: [{ text: 'OK' }]
      });
      setShowErrorAlert(true);
      return;
    }
    if (password !== confirmPassword) {
      setAlertConfig({
        title: 'Error',
        message: 'Passwords do not match.',
        buttons: [{ text: 'OK' }]
      });
      setShowErrorAlert(true);
      return;
    }

    setIsLoading(true);
    let profileImageUrl = null;

    if (profileImage) {
      profileImageUrl = await uploadImageToCloudinary(profileImage);
      if (!profileImageUrl) {
        setAlertConfig({
          title: 'Error',
          message: 'Image upload failed. Please try again.',
          buttons: [{ text: 'OK' }]
        });
        setShowErrorAlert(true);
        setIsLoading(false);
        return;
      }
    }else {
      profileImageUrl = 'https://imgs.search.brave.com/1WFIpUNAOtVXo51SuasJnMAgOsPwQQXErqrO6H1Ps1M/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzk4LzFk/LzZiLzk4MWQ2YjJl/MGNjYjVlOTY4YTA2/MThjOGQ0NzY3MWRh/LmpwZw'
    }

    try {
      const response = await axios.post('http://192.168.0.188:5000/api/auth/signup', {
        fullName,
        email,
        password,
        profileImage: profileImageUrl,
      });

      if (response.status === 201) {
        setAlertConfig({
          title: 'Success',
          message: 'Registration successful',
          buttons: [{
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }]
        });
        setShowSuccessAlert(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAlertConfig({
        title: 'Error',
        message: 'Registration failed',
        buttons: [{ text: 'OK' }]
      });
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Text style={[styles.welcomeText, { color: theme.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Join CIMS to help our community</Text>
        </View>

        <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.surface }]}>
              <Ionicons name="person-add" size={40} color={theme.primary} />
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
            <Ionicons name="camera" size={14} color={theme.surface} />
          </View>
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <View style={[styles.inputContainer, { borderBottomColor: theme.border }]}>
            <Ionicons name="person-outline" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholderTextColor={theme.textSecondary}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={[styles.inputContainer, { borderBottomColor: theme.border }]}>
            <Ionicons name="mail-outline" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholderTextColor={theme.textSecondary}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputContainer, { borderBottomColor: theme.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholderTextColor={theme.textSecondary}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={[styles.inputContainer, { borderBottomColor: theme.border }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholderTextColor={theme.textSecondary}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.signupButton, { backgroundColor: theme.primary }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.surface} />
            ) : (
              <Text style={[styles.signupButtonText, { color: theme.surface }]}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginLink, { color: theme.primary }]}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomAlert
        visible={showErrorAlert}
        {...alertConfig}
        onClose={() => setShowErrorAlert(false)}
      />

      <CustomAlert
        visible={showSuccessAlert}
        {...alertConfig}
        onClose={() => setShowSuccessAlert(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginTop: '10%',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  imagePickerContainer: {
    alignSelf: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
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
  formContainer: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    marginBottom: 24,
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  signupButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  footerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    marginTop: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});
