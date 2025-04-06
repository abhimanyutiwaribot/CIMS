import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export const NOTIFICATION_TYPES = {
  STATUS_UPDATE: 'STATUS_UPDATE',
  ISSUE_VERIFIED: 'ISSUE_VERIFIED',
  ISSUE_REJECTED: 'ISSUE_REJECTED',
  COMMENT_ADDED: 'COMMENT_ADDED',
  ISSUE_RESOLVED: 'ISSUE_RESOLVED'
};

export const createNotificationMessage = (type, issue) => {
  const notificationConfig = {
    'STATUS_UPDATE': {
      title: '🔄 Issue Status Updated',
      body: `Your reported issue "${issue.title}" has been updated to ${issue.status.replace('_', ' ')}`,
      badge: 1,
      subtitle: 'Status Change',
      priority: 'high',
      categoryId: 'status',
      vibrate: [0, 250, 250, 250],
    },
    'ISSUE_VERIFIED': {
      title: '✅ Issue Verified',
      body: `Your report "${issue.title}" has been verified by our team`,
      badge: 1,
      subtitle: 'Verification',
      priority: 'high',
      categoryId: 'verification',
      vibrate: [0, 250, 250, 250],
    },
    'ISSUE_REJECTED': {
      title: '❌ Issue Rejected',
      body: `Unfortunately, your report "${issue.title}" could not be verified`,
      badge: 1,
      subtitle: 'Verification',
      priority: 'high',
      categoryId: 'verification',
      vibrate: [0, 250, 250, 250],
    },
    'ISSUE_RESOLVED': {
      title: '🎉 Issue Resolved',
      body: `Great news! The issue "${issue.title}" has been resolved`,
      badge: 1,
      subtitle: 'Resolution',
      priority: 'high',
      categoryId: 'resolution',
      vibrate: [0, 250, 250, 250],
    }
  };

  const config = notificationConfig[type] || {};
  return {
    ...config,
    data: {
      type,
      issueId: issue._id,
      screen: 'IssueDetails',
      params: { issue }
    }
  };
};

export const sendNotification = async (expoPushToken, title, body, data = {}) => {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
      categoryIdentifier: data.categoryId,
      priority: 'high',
      channelId: 'issues', // Android specific
      badge: 1,
      _displayInForeground: true,
      // Android specific
      android: {
        channelId: 'issues',
        color: '#3b82f6',
        priority: 'high',
        smallIcon: 'ic_notification',
        vibrate: [0, 250, 250, 250],
        sticky: false
      },
      // iOS specific
      ios: {
        sound: true,
        _displayInForeground: true,
        threadId: data.categoryId
      }
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};
