import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Share, ActivityIndicator, RefreshControl } from "react-native";
import { useTheme } from '../context/ThemeContext';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/CustomAlert';
import { io } from 'socket.io-client';

export default function IssueDetailsScreen({ route, navigation }) {
  const { issue } = route.params;  // Remove issueId, we're passing full issue object
  const { theme } = useTheme();
  const [issueDetails, setIssueDetails] = useState(issue);
  const [loading, setLoading] = useState(false);  // Set to false since we have initial data
  const [refreshing, setRefreshing] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const fetchIssueDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(
        `http://192.168.0.194:5000/api/issues/${issue._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setIssueDetails(response.data);
    } catch (error) {
      console.error('Error fetching issue details:', error);
      setAlertConfig({
        title: 'Error',
        message: 'Failed to load issue details',
        buttons: [{ text: 'OK' }]
      });
      setShowErrorAlert(true);
    }
  };

  useEffect(() => {
    const socket = io('http://192.168.0.194:5000', {
      transports: ['websocket'],
      reconnection: true,
      timeout: 10000,
      forceNew: true
    });

    socket.connect();

    socket.on('issueUpdate', (data) => {
      console.log('Received update:', data); // Add this debug log
      if (data.issue._id === issueDetails?._id) {
        console.log('Updating issue:', data.issue); // Add this debug log
        setIssueDetails(prevIssue => ({
          ...prevIssue,
          ...data.issue
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [issueDetails?._id]); // Only re-establish connection when issue ID changes

  useEffect(() => {
    fetchIssueDetails();
  }, [issue._id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchIssueDetails().finally(() => setRefreshing(false));
  }, [issue._id]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Issue: ${issueDetails.title}\nLocation: ${issueDetails.location}\nStatus: ${issueDetails.status}`,
        title: 'Share Issue Details',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return theme.error;
      case 'medium': return theme.warning;
      case 'low': return theme.success;
      default: return theme.primary;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return theme.success;
      case 'in_progress': return theme.warning;
      case 'pending_verification': return theme.textSecondary;
      case 'verified': return theme.primary;
      case 'rejected': return theme.error;
      default: return theme.textSecondary;
    }
  };

  const renderUpdates = () => (
    <View style={[styles.section, { backgroundColor: theme.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Updates</Text>
      {issueDetails?.updates?.length > 0 ? (
        <View style={styles.updatesContainer}>
          {issueDetails.updates.map((update, index) => (
            <View 
              key={index} 
              style={[
                styles.updateItem, 
                { 
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                }
              ]}
            >
              <View style={styles.updateHeader}>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: getStatusColor(update.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {update.status.replace(/_/g, ' ')}
                  </Text>
                </View>
                <Text style={[styles.updateDate, { color: theme.textSecondary }]}>
                  {new Date(update.date).toLocaleDateString()}
                </Text>
              </View>
              
              <Text style={[styles.updateMessage, { color: theme.text }]}>
                {update.message}
              </Text>

              <View style={styles.updateFooter}>
                <View style={styles.adminInfo}>
                  <Ionicons 
                    name="person-circle-outline" 
                    size={20} 
                    color={theme.textSecondary} 
                  />
                  <Text style={[styles.adminName, { color: theme.textSecondary }]}>
                    {update.updatedBy?.name || 'Admin'}
                  </Text>
                </View>
              </View>
            </View>
          )).reverse()}
        </View>
      ) : (
        <View style={[styles.emptyUpdates, { borderColor: theme.border }]}>
          <Ionicons 
            name="notifications-outline" 
            size={40} 
            color={theme.textSecondary} 
          />
          <Text style={[styles.noUpdates, { color: theme.textSecondary }]}>
            No updates yet
          </Text>
        </View>
      )}
    </View>
  );

  const renderMap = () => {
    if (!issueDetails?.location?.latitude || !issueDetails?.location?.longitude) {
      return (
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>
          Location not available
        </Text>
      );
    }

    return (
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: issueDetails.location.latitude,
          longitude: issueDetails.location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        scrollEnabled={false}
      >
        <Marker coordinate={issueDetails.location} />
      </MapView>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!issueDetails) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>Issue not found</Text>
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
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.text }]}>{issueDetails.title}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(issueDetails.priority) }]}>
              <Text style={styles.priorityText}>{issueDetails.priority}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Image Section */}
        {issueDetails.imageUrl && (
          <Image source={{ uri: issueDetails.imageUrl }} style={styles.image} />
        )}

        {/* Status Section */}
        <View style={[styles.statusContainer, { backgroundColor: theme.surface }]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(issueDetails.status) }]} />
            <Text style={[styles.statusText, { color: theme.text }]}>
              Status: {issueDetails.status || 'Pending'}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>
            Reported on: {new Date(issueDetails.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Description Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {issueDetails.description}
          </Text>
        </View>

        {/* Location Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Location</Text>
          {renderMap()}
        </View>

        {/* Updates Section */}
        {renderUpdates()}
      </ScrollView>

      <CustomAlert
        visible={showErrorAlert}
        {...alertConfig}
        onClose={() => setShowErrorAlert(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  shareButton: {
    padding: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 14,
  },
  section: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  updateItem: {
    marginBottom: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    paddingTop: 8,
    paddingRight: 8,
    borderRadius: 8,
    elevation: 1,
  },
  updateStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  updateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  updateAuthor: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  updateText: {
    fontSize: 14,
    marginBottom: 4,
  },
  updateDate: {
    fontSize: 12,
  },
  noUpdates: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  updatesContainer: {
    gap: 12,
  },
  updateItem: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  updateMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  updateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adminName: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyUpdates: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    gap: 8,
  },
});
