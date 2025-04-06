import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

// Replace Slider with simple buttons for severity
const severityLevels = [
  { label: 'Low', value: 0.25 },
  { label: 'Medium', value: 0.5 },
  { label: 'High', value: 0.75 },
  { label: 'Critical', value: 1 }
];

export default function IssueDetailsScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { category, location, imageUrl } = route.params;
  const [severity, setSeverity] = useState(0.5);
  const [description, setDescription] = useState('');
  const [firstNoticed, setFirstNoticed] = useState('');
  const [alertConfig, setAlertConfig] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const handleContinue = () => {
    if (!severity || !description || !firstNoticed) {
      setAlertConfig({
        title: 'Missing Information',
        message: 'Please fill in all required fields',
        buttons: [{ text: 'OK' }]
      });
      setShowAlert(true);
      return;
    }

    navigation.navigate('ReviewReport', {
      category,
      location,
      severity: severity * 100,
      description,
      firstNoticed,
      imageUrl
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
          Step 4 of 5
        </Text>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View style={[styles.progress, { backgroundColor: theme.primary, width: '80%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Issue Details</Text>
        
        {/* Severity Selection */}
        <View style={styles.severityContainer}>
          <Text style={[styles.label, { color: theme.text }]}>How severe is this issue?</Text>
          <View style={styles.severityButtons}>
            {severityLevels.map((level) => (
              <TouchableOpacity
                key={level.label}
                style={[
                  styles.severityButton,
                  { 
                    backgroundColor: severity === level.value ? theme.primary : theme.surface,
                    borderColor: theme.border
                  }
                ]}
                onPress={() => setSeverity(level.value)}
              >
                <Text 
                  style={[
                    styles.severityButtonText, 
                    { color: severity === level.value ? theme.surface : theme.text }
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* When First Noticed */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>When did you first notice this?</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.surface,
              color: theme.text,
              borderColor: theme.border
            }]}
            placeholder="e.g., Today, Yesterday, Last week"
            placeholderTextColor={theme.textSecondary}
            value={firstNoticed}
            onChangeText={setFirstNoticed}
          />
        </View>

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Additional Details</Text>
          <TextInput
            style={[styles.textArea, { 
              backgroundColor: theme.surface,
              color: theme.text,
              borderColor: theme.border
            }]}
            placeholder="Provide any additional details that might help"
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, { backgroundColor: theme.primary }]}
          onPress={handleContinue}
        >
          <Text style={[styles.buttonText, { color: theme.surface }]}>Review Report</Text>
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
  progressContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  severityContainer: {
    marginBottom: 24,
  },
  severityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  severityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  severityButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
