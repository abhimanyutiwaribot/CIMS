import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

export default function ReportSuccessScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { issue } = route.params || {}; // Use optional chaining and provide default empty object

  const handleViewReports = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'My Reports' }],
    });
  };

  const handleReportAnother = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'ReportIntro' }],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Success Animation */}
        <LottieView
          source={require('../../assets/animations/success.json')}
          autoPlay
          loop={false}
          style={styles.animation}
        />

        <Text style={[styles.title, { color: theme.text }]}>
          Report Submitted Successfully!
        </Text>

        <Text style={[styles.message, { color: theme.textSecondary }]}>
          Thank you for helping improve our community. Your report has been received and will be reviewed shortly.
        </Text>

        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>What's Next?</Text>
          <View style={styles.infoItem}>
            <MaterialIcons name="verified" size={24} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Your report will be verified by our team
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="notifications" size={24} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              You'll receive updates on the progress
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleViewReports}
          >
            <Text style={[styles.buttonText, { color: theme.surface }]}>View My Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.outlineButton, { borderColor: theme.primary }]}
            onPress={handleReportAnother}
          >
            <Text style={[styles.outlineButtonText, { color: theme.primary }]}>Report Another Issue</Text>
          </TouchableOpacity>
        </View>
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
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  infoCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
