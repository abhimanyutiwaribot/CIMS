import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LogoScreen({ onLogoDone }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          Gilroy: require('../assets/Fonts/Gilroy-Bold.ttf'), // Ensure this path is correct
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts', error);
      }
    };

    loadFonts();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      const timer = setTimeout(async () => {
        await AsyncStorage.setItem('introSeen', 'true');
        onLogoDone();
      }, 3000); // Show logo for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Render nothing until the font is loaded
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={styles.logoText}>Welcome To</Text>
      <Text style={styles.cimsText}>CIMS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  cimsText: {
    fontSize: 48,
    fontFamily: 'Gilroy', // Use the Gilroy font
    color: '#000',
  },
});