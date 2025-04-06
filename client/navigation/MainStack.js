import React from "react";
import { Text, View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from '../context/ThemeContext';
import HomeScreen from "../screens/HomeScreen";
// import ReportIssueScreen from "../screens/ReportIssueScreen";
import MyReportsScreen from "../screens/MyReportsScreen";
import ProfileScreen from "../screens/ProfileScreen.js";
import IssueDetailsScreen from "../screens/IssuesScreen";
import AuthStack from "./AuthStack.js";
import { Ionicons } from "@expo/vector-icons";
import EditProfileScreen from "../screens/EditProfileScreen";
import ReportIssueStack from './ReportIssueStack';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tabs with setIsLoggedIn prop
const BottomTabs = ({ setIsLoggedIn }) => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Report") iconName = "add-circle";
          else if (route.name === "My Reports") iconName = "document-text";
          else if (route.name === "Profile") iconName = "person";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: ({ color }) => (
          <Text style={{ color, fontSize: 10, marginBottom: 10 }}>
            {route.name}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen 
        name="Report" 
        component={ReportIssueStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen name="My Reports" component={MyReportsScreen} />
      <Tab.Screen name="Profile">
        {(props) => <ProfileScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// Main Stack with Profile Setup
export default function MainStack({ setIsLoggedIn }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {(props) => <BottomTabs {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="IssueDetails" component={IssueDetailsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}
