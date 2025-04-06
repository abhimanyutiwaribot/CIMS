import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, RefreshControl, ScrollView } from "react-native";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from '../context/ThemeContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';

const API_URL = "http://192.168.0.194:5000/api";

export default function MyReportsScreen({ navigation }) {
  const { theme } = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.get(`${API_URL}/issues/my-reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error.response?.data || error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Make sure refreshing is set to false
    }
  }, []); // Empty dependency array since we don't use any external values

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    const socket = io('http://192.168.0.194:5000', {
      transports: ['websocket'],
      reconnection: true,
      timeout: 10000,
      forceNew: true
    });

    socket.on('connect', () => {
      console.log('Socket connected in MyReportsScreen:', socket.id);
    });

    socket.on('issueUpdate', (data) => {
      console.log('Received update in MyReportsScreen:', data);
      if (data.type === 'STATUS_UPDATE' || data.type === 'VERIFICATION_UPDATE') {
        setReports(prev => prev.map(report => {
          if (report._id === data.issue._id) {
            console.log('Updating report:', data.issue);
            return {
              ...report,
              ...data.issue
            };
          }
          return report;
        }));
      }
    });

    socket.connect();

    return () => {
      console.log('Disconnecting socket in MyReportsScreen');
      socket.disconnect();
    };
  }, []); // Empty dependency array to create socket connection only once

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReports();
  }, [fetchReports]);

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

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.reportCard, { backgroundColor: theme.surface }]}
      onPress={() => navigation.navigate('IssueDetails', { issue: item })} // Change from issueId to issue
    >
      <View style={styles.reportHeader}>
        <View style={styles.headerLeft}>
          <Text style={[styles.reportTitle, { color: theme.text }]}>{item.title}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>
              {item.status?.replace('_', ' ') || 'Pending'}
            </Text>
          </View>
        </View>
        <Ionicons 
          name="chevron-forward"
          size={24} 
          color={theme.textSecondary} 
        />
      </View>

      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.reportImage} />
      )}

      <View style={styles.reportContent}>
        <Text style={[styles.reportDescription, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.reportFooter}>
          <View style={styles.priorityContainer}>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
            <Text style={[styles.priorityText, { color: theme.text }]}>{item.priority}</Text>
          </View>
          
          <View style={styles.metaContainer}>
            <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.dateText, { color: theme.textSecondary }]}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.locationText, { color: theme.textSecondary }]}>
              View on map
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>My Reports</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {reports.length} {reports.length === 1 ? 'Report' : 'Reports'}
          </Text>
        </View>

        {reports.length === 0 ? (
          <ScrollView
            contentContainerStyle={[styles.emptyContainer, { flex: 1 }]}
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
            <MaterialIcons name="report-problem" size={50} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No reports found
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Pull down to refresh
            </Text>
          </ScrollView>
        ) : (
          <FlatList
            data={reports}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
                progressBackgroundColor={theme.surface}
              />
            }
          />
        )}
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  reportCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12, 
  },
  headerLeft: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  reportImage: {
    width: '100%',
    height: 150,
  },
  reportContent: {
    padding: 16,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
  },
  locationText: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    fontStyle: 'italic',
  },
});