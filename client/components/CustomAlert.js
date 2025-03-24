import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CustomAlert = ({ 
  visible = false, 
  title = '', 
  message = '', 
  buttons = [{ text: 'OK' }], // Default button if none provided
  onClose = () => {} 
}) => {
  const { theme } = useTheme();

  // Ensure buttons is always an array
  const safeButtons = Array.isArray(buttons) ? buttons : [{ text: 'OK' }];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.alertContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
          <View style={styles.buttonContainer}>
            {safeButtons.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  { 
                    backgroundColor: btn.style === 'cancel' ? theme.surface : theme.primary,
                    borderColor: theme.border,
                    borderWidth: btn.style === 'cancel' ? 1 : 0,
                  }
                ]}
                onPress={() => {
                  onClose();
                  btn.onPress && btn.onPress();
                }}
              >
                <Text 
                  style={[
                    styles.buttonText, 
                    { 
                      color: btn.style === 'cancel' ? theme.text : theme.surface,
                      fontWeight: btn.style === 'cancel' ? 'normal' : 'bold'
                    }
                  ]}
                >
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: Dimensions.get('window').width * 0.85,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
});

export default CustomAlert;
