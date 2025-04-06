import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';


export default function ReportIntroScreen({ navigation }) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
       <LottieView
        source={require('../../assets/animations/hero.json')}
        autoPlay
        loop={true}
        style={styles.animation}
        />

        <Text style={[styles.title, { color: theme.text }]}>
          Help improve our community
        </Text>
        
        <Text style={[styles.stats, { color: theme.primary }]}>
          87% of reported issues resolved within 7 days
        </Text>
        
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Your reports help make our community better. Report issues like potholes, broken streetlights, and more.
        </Text>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('IssueCategory')}
        >
          <Text style={[styles.buttonText, { color: theme.surface }]}>
            Start Reporting
          </Text>
          <MaterialIcons name="arrow-forward" size={24} color={theme.surface} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  animation: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  stats: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
