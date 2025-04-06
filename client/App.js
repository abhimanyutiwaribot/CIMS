import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Platform, StatusBar, View, ActivityIndicator } from 'react-native';  // Add Platform import
import AuthStack from './navigation/AuthStack';
import MainStack from './navigation/MainStack'; // Main stack for the app
import LogoScreen from './screens/LogoScreen'; // Import the LogoScreen
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import axios from 'axios';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import NotificationBanner from './components/NotificationBanner';
import { setupNotificationChannels } from './services/notificationService';

const API_URL = "http://192.168.0.194:5000/api";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

// Add notification channels for Android
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('issues', {
    name: 'Issues',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#3b82f6',
    sound: 'notification.wav',
    enableVibrate: true,
    enableLights: true,
  });
}

// Move this outside of any component
const registerForPushNotificationsAsync = async () => {
  try {
    if (!Device.isDevice) {
      alert('Physical device needed for Push Notifications');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    // Get the token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId
    });

    console.log('Expo Push Token:', token.data);

    // Save token to server
    const userToken = await AsyncStorage.getItem('userToken');
    if (userToken) {
      await axios.post(
        `${API_URL}/user/notification-token`,
        { expoPushToken: token.data },
        { headers: { Authorization: `Bearer ${userToken}` }}
      );
    }

    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
  }
};

// Add this background handler outside any component
Notifications.addNotificationResponseReceivedListener(response => {
  const data = response.notification.request.content.data;
  console.log('Notification clicked:', data);
  
  // Navigate based on notification type
  if (data.screen) {
    navigation.navigate(data.screen, { issueId: data.issueId });
  }
});

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

const handleNotification = async (notification) => {
  const { type, issueId, status } = notification.data;

  switch (type) {
    case 'STATUS_UPDATE':
      navigation.navigate('IssueDetails', { issueId });
      break;
    case 'TEST':
      console.log('Test notification received');
      break;
    case 'ISSUE_VERIFIED':
    case 'ISSUE_REJECTED':
      navigation.navigate('MyReports');
      break;
  }
};

// Create a wrapper component that can access the theme context
const AppContent = () => {
  const { isDarkMode } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const navigation = useRef(null);  // Add this line
  const [notification, setNotification] = useState(null);

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
      await setupNotificationChannels();
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission not granted');
          return;
        }

        // Handle notifications when app is in foreground
        const foregroundSubscription = Notifications.addNotificationReceivedListener(
          notification => {
            console.log('Received notification:', notification);
          }
        );

        // Handle clicking on notification
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(
          response => {
            console.log('Notification clicked:', response);
            handleNotification(response.notification.request.content);
          }
        );

        return () => {
          foregroundSubscription.remove();
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

  useEffect(() => {
    if (isLoggedIn) {
      registerForPushNotificationsAsync().then(token => {
        console.log('Registration complete with token:', token);
      });
    }
  }, [isLoggedIn]); // Run when login state changes

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const { title, body, data } = notification.request.content;
      setNotification({
        message: body,
        type: data.type || 'info',
        onPress: () => {
          if (data.screen) {
            navigation.current?.navigate(data.screen, data.params);
          }
        }
      });
    });

    return () => subscription.remove();
  }, []);

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
      <NavigationContainer
        ref={navigation}  // Add this line
      >
        {isLoggedIn ? (
          <MainStack setIsLoggedIn={setIsLoggedIn} />
        ) : (
          <AuthStack setIsLoggedIn={setIsLoggedIn} />
        )}
      </NavigationContainer>
      {notification && (
        <NotificationBanner
          {...notification}
          onClose={() => setNotification(null)}
        />
      )}
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