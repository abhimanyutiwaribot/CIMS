import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomAlert from '../components/CustomAlert';
import * as Location from 'expo-location';

export default function LoginScreen({ setIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAlertConfig({
          title: 'Location Access Required',
          message: 'This app needs location access to show nearby issues and report locations accurately.',
          buttons: [{ text: 'OK' }]
        });
        setShowErrorAlert(true);
      }
    } catch (error) {
      console.error('Error requesting location:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setAlertConfig({
        title: 'Error',
        message: 'All fields are required.',
        buttons: [{ text: 'OK' }]
      });
      setShowErrorAlert(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://192.168.0.194:5000/api/auth/login', {
        email,
        password,
      });

      if (response.status === 200) {
        const { token, fullName } = response.data;

        if (!token) {
          throw new Error('Token is undefined');
        }

        await AsyncStorage.multiSet([
          ['userToken', token],
          ['fullName', fullName]
        ]);

        // Add a console log to verify token is saved
        console.log('Token saved:', token);
        
        // Request location permission after successful login
        await requestLocationPermission();
        
        // Update the logged in state in App.js
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      setAlertConfig({
        title: 'Login Failed',
        message: error.response?.data?.message || 'Invalid email or password',
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
          <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome Back!</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sign in to continue to Reparo</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={[styles.inputContainer, { borderBottomColor: theme.border }]}>
            <Ionicons name="mail-outline" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholderTextColor={theme.textSecondary}
              placeholder='Email'
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
              placeholder='Password'
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: theme.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.surface} />
            ) : (
              <Text style={[styles.loginButtonText, { color: theme.surface }]}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={[styles.signupLink, { color: theme.primary }]}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomAlert
        visible={showErrorAlert}
        {...alertConfig}
        onClose={() => setShowErrorAlert(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerContainer: {
    marginTop: '20%',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
  loginButton: {
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
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
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
  signupLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});
