import { createStackNavigator } from '@react-navigation/stack';
import ReportIntroScreen from '../screens/Report/ReportIntroScreen';
import IssueCategoryScreen from '../screens/Report/IssueCategoryScreen';
import LocationPickerScreen from '../screens/Report/LocationPickerScreen';
import MediaPickerScreen from '../screens/Report/MediaPickerScreen';
import IssueDetailsScreen from '../screens/Report/IssueDetailsScreen';
import ReviewScreen from '../screens/Report/ReviewScreen';
import ReportSuccessScreen from '../screens/Report/ReportSuccessScreen';

const Stack = createStackNavigator();

export default function ReportStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="ReportIntro"
    >
      <Stack.Screen name="ReportIntro" component={ReportIntroScreen} />
      <Stack.Screen name="IssueCategory" component={IssueCategoryScreen} />
      <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
      <Stack.Screen name="MediaPicker" component={MediaPickerScreen} />
      <Stack.Screen name="IssueDetails" component={IssueDetailsScreen} />
      <Stack.Screen name="ReviewReport" component={ReviewScreen} />
      <Stack.Screen 
        name="ReportSuccess" 
        component={ReportSuccessScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
