import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const CATEGORIES = [
  { id: 'pothole', title: 'Pothole', icon: 'warning' },
  { id: 'streetlight', title: 'Street Light', icon: 'lightbulb' },
  { id: 'garbage', title: 'Garbage', icon: 'delete' },
  { id: 'road_damage', title: 'Road Damage', icon: 'construction' },
  { id: 'flooding', title: 'Flooding', icon: 'water-damage' },
  { id: 'sidewalk', title: 'Sidewalk Issue', icon: 'directions-walk' },
  { id: 'graffiti', title: 'Graffiti', icon: 'format-paint' },
  { id: 'traffic_signal', title: 'Traffic Signal', icon: 'traffic' }
];

export default function IssueCategoryScreen({ navigation }) {
  const { theme } = useTheme();

  const handleCategorySelect = (category) => {
    console.log('Selected category:', category); // Debug log
    navigation.navigate('LocationPicker', { category });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.categoryCard, { backgroundColor: theme.surface }]}
      onPress={() => handleCategorySelect(item)}
    >
      <MaterialIcons name={item.icon} size={32} color={theme.primary} />
      <Text style={[styles.categoryTitle, { color: theme.text }]}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>What's the issue?</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Select the type of issue you want to report
        </Text>
      </View>

      <FlatList
        data={CATEGORIES}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  grid: {
    padding: 12,
  },
  categoryCard: {
    flex: 1,
    margin: 8,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  }
});
