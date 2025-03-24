import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './navigation/AuthStack';
import MainStack from './navigation/MainStack'; // Main stack for the app
import LogoScreen from './screens/LogoScreen'; // Import the LogoScreen
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const API_URL = "http://192.168.0.188:5000/api";

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId
    })).data;

    console.log('Expo token:', token);
  }

  return token;
}

// Add this test function
const testNotification = async () => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test notification",
        data: { screen: 'Home' },
      },
      trigger: { seconds: 2 },
    });
    console.log('Test notification scheduled');
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

// Create a wrapper component that can access the theme context
const AppContent = () => {
  const { isDarkMode } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    const checkInitialState = async () => {
      try {
        const [token, onboarding] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('onboardingComplete')
        ]);

        if (token) {
          try {
            const response = await axios.get(`${API_URL}/user/profile`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setIsLoggedIn(true);
          } catch (error) {
            await AsyncStorage.removeItem('userToken');
            setIsLoggedIn(false);
          }
        }
        
        setOnboardingComplete(!!onboarding);
      } catch (error) {
        console.error('Error checking initial state:', error);
      } finally {
        setLoading(false);
      }
    };

    checkInitialState();
  }, []);

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission not granted');
          return;
        }

        // Add test notification when permissions are granted
        await testNotification();

        // Handle notifications when app is in foreground
        const subscription = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification received:', notification);
        });

        // Handle clicking on notification
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification clicked:', response);
          // Add navigation logic here based on notification data
        });

        return () => {
          subscription.remove();
          responseSubscription.remove();
        };
      } catch (error) {
        console.error('Notification setup error:', error);
      }
    };

    if (isLoggedIn) {
      setupNotifications();
    }
  }, [isLoggedIn]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#000000' : '#ffffff'}
      />
      <NavigationContainer>
        {isLoggedIn ? (
          <MainStack setIsLoggedIn={setIsLoggedIn} />
        ) : (
          <AuthStack setIsLoggedIn={setIsLoggedIn} />
        )}
      </NavigationContainer>
    </>
  );
};

// Main App component wraps everything with ThemeProvider
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}