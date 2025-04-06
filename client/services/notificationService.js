import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Define notification channels
export const setupNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('status-updates', {
      name: 'Status Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3b82f6',
      sound: 'notification.wav',
      enableVibrate: true,
      enableLights: true,
    });

    await Notifications.setNotificationChannelAsync('verification', {
      name: 'Verification Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10b981',
      sound: 'notification.wav',
      enableVibrate: true,
      enableLights: true,
    });
  }
};

export const showLocalNotification = async (title, body, data = {}) => {
  try {
    const notificationContent = {
      title,
      body,
      data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      color: '#3b82f6',
      vibrate: [0, 250, 250, 250],
      android: {
        channelId: data.type === 'STATUS_UPDATE' ? 'status-updates' : 'verification',
        color: '#3b82f6',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        smallIcon: 'ic_notification',
        largeIcon: data.imageUrl,
        style: {
          type: Notifications.AndroidStyle.MESSAGING,
          person: {
            name: 'CIMS Admin',
            icon: 'ic_admin_avatar'
          },
          messages: [
            {
              text: body,
              timestamp: Date.now(),
            }
          ]
        },
        actions: [
          {
            title: 'View Details',
            icon: 'ic_view',
            buttonType: Notifications.AndroidButtonType.DEFAULT,
          }
        ],
        vibrate: [0, 250, 250, 250],
        lights: true,
        lightColor: data.type === 'STATUS_UPDATE' ? '#3b82f6' : '#10b981',
      },
      ios: {
        sound: true,
        presentationOptions: {
          banner: true,
          sound: true,
          badge: true,
        },
        threadId: data.type,
        attachments: data.imageUrl ? [{ url: data.imageUrl }] : undefined,
        categoryIdentifier: data.type === 'STATUS_UPDATE' ? 'status' : 'verification'
      }
    };

    await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: null
    });
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

export const setBadgeCount = async (count) => {
  if (Platform.OS === 'ios') {
    await Notifications.setBadgeCountAsync(count);
  }
};
