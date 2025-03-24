import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Alert, SafeAreaView, ScrollView, RefreshControl } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomAlert from "../components/CustomAlert";

// Replace with your actual backend URL
const API_URL = "http://192.168.0.188:5000/api";

export default function ProfileScreen({ setIsLoggedIn }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const navigation = useNavigation();
  const { theme } = useTheme();

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error("No token found");
        navigation.navigate('Login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
    

      const [profileRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/user/profile`, { headers }),
        axios.get(`${API_URL}/user/stats`, { headers })
      ]);

      setUser({
        fullName: profileRes.data.fullName,
        email: profileRes.data.email,
        profilePic: profileRes.data.profilePic || 'https://via.placeholder.com/150'
      });
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      setAlertConfig({
        title: 'Error',
        message: 'Failed to load profile data',
        buttons: [{ text: 'OK' }]
      });
      setShowAlertDialog(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      setAlertConfig({
        title: 'Confirm Logout',
        message: 'Are you sure you want to logout?',
        buttons: [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowAlertDialog(false)
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              setLoading(true);
              try {
                const token = await AsyncStorage.getItem('userToken');
                // Call logout API if token exists
                if (token) {
                  await axios.post(`${API_URL}/auth/logout`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                }
                await AsyncStorage.clear();
                setIsLoggedIn(false); // This will trigger App.js to show AuthStack
              } catch (error) {
                console.error('Error during logout:', error);
                // Even if API call fails, clear storage and logout
                await AsyncStorage.clear();
                setIsLoggedIn(false);
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      });
      setShowAlertDialog(true);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { currentUser: user });
  };

  const renderProfileStats = () => (
    <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: theme.primary }]}>{stats?.total || 0}</Text>
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Reports</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: theme.success }]}>{stats?.resolved || 0}</Text>
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Resolved</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: theme.warning }]}>{stats?.pending || 0}</Text>
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
      </View>
    </View>
  );

  const renderProfileCompletion = () => (
    <View style={[styles.completionContainer, { backgroundColor: theme.surface }]}>
      <View style={styles.completionHeader}>
        <Text style={[styles.completionTitle, { color: theme.text }]}>Profile Completion</Text>
        <Text style={[styles.completionPercentage, { color: theme.primary }]}>
          {stats?.profileCompletion || 0}%
        </Text>
      </View>
      <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
        <View 
          style={[
            styles.progress, 
            { 
              backgroundColor: theme.primary, 
              width: `${stats?.profileCompletion || 0}%` 
            }
          ]} 
        />
      </View>
    </View>
  );

  const renderSettingsOptions = () => (
    <View style={[styles.settingsContainer, { backgroundColor: theme.surface }]}>
      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Ionicons name="notifications-outline" size={24} color={theme.primary} />
          <Text style={[styles.settingText, { color: theme.text }]}>Notifications</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Ionicons name="lock-closed-outline" size={24} color={theme.primary} />
          <Text style={[styles.settingText, { color: theme.text }]}>Privacy & Security</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Ionicons name="help-circle-outline" size={24} color={theme.primary} />
          <Text style={[styles.settingText, { color: theme.text }]}>Help & Support</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
            progressBackgroundColor={theme.surface}
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: user?.profilePic || "https://via.placeholder.com/150" }}
            style={styles.profilePic}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: theme.text }]}>{user?.fullName || "User"}</Text>
            <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email}</Text>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: theme.primary }]}
              onPress={handleEditProfile}  // Change this line
            >
              <Text style={[styles.editButtonText, { color: theme.surface }]}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        {renderProfileStats()}

        {/* Profile Completion */}
        {renderProfileCompletion()}

        {/* Settings Options */}
        {renderSettingsOptions()}

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: theme.error }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={theme.surface} />
          <Text style={[styles.logoutText, { color: theme.surface }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomAlert
        visible={showAlertDialog}
        {...alertConfig}
        onClose={() => setShowAlertDialog(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  completionContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  completionPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 3,
  },
  settingsContainer: {
    borderRadius: 12,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});