import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from '../context/ThemeContext';


const API_URL = "http://192.168.0.188:5000/api";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [user, setUser] = useState({ fullName: "", profilePic: "" });

  // Fetch User Profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const response = await axios.get(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUser({
          fullName: response.data.fullName,
          profilePic: response.data.profilePic || 'https://via.placeholder.com/150'
        });
      } catch (error) {
        console.error("Error fetching profile:", error.response?.data || error);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Profile Header */}
        <View style={styles.profileContainer}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: user.profilePic }}
              style={styles.profilePic}
            />
            <View style={styles.textContainer}>
              <Text style={[styles.welcomeText, { color: theme.text }]}>
                Welcome, {user.fullName || "User"}!
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                How can we help you today?
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={toggleTheme}
            style={[styles.themeToggle, { backgroundColor: theme.surface }]}
          >
            <Ionicons 
              name={isDarkMode ? "sunny" : "moon"} 
              size={24} 
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.primary }]} 
            onPress={() => navigation.navigate("Report")}
          >
            <Ionicons name="add-circle" size={40} color={theme.surface} />
            <Text style={[styles.buttonText, { color: theme.surface }]}>Report an Issue</Text>
            <Text style={[styles.buttonSubtext, { color: theme.surface }]}>
              Report problems in your area
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.surface }]} 
            onPress={() => navigation.navigate("My Reports")}
          >
            <Ionicons name="document-text" size={40} color={theme.primary} />
            <Text style={[styles.buttonText, { color: theme.text }]}>My Reports</Text>
            <Text style={[styles.buttonSubtext, { color: theme.textSecondary }]}>
              View your reported issues
            </Text>
          </TouchableOpacity>
        </View>

        {/* Usage Stats */}
        <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>24h</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Avg. Response</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.success }]}>95%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Resolution</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Update styles to match new layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingRight: 8,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#ccc",
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    marginRight: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  actionsContainer: {
    marginTop: 24,
    gap: 16,
  },
  actionButton: {
    padding: 20,
    borderRadius: 16,
    flexDirection: 'column',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  buttonSubtext: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  }
});