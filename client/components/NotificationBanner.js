import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function NotificationBanner({ type = 'info', message, onPress, duration = 3000, onClose }) {
  const { theme } = useTheme();
  const translateY = new Animated.Value(-100);

  useEffect(() => {
    // Slide in
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 12,
      bounciness: 5
    }).start();

    // Auto hide after duration
    const timer = setTimeout(() => {
      hideNotification();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const hideNotification = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true
    }).start(() => onClose && onClose());
  };

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: 'check-circle', color: theme.success };
      case 'error':
        return { icon: 'error', color: theme.error };
      case 'warning':
        return { icon: 'warning', color: theme.warning };
      default:
        return { icon: 'info', color: theme.primary };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.surface,
          transform: [{ translateY }],
          shadowColor: theme.shadow
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.content}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <MaterialIcons name={icon} size={24} color={color} />
        <Text style={[styles.message, { color: theme.text }]} numberOfLines={2}>
          {message}
        </Text>
        <TouchableOpacity onPress={hideNotification}>
          <MaterialIcons name="close" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  }
});
