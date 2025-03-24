import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Animated, 
  useWindowDimensions, TouchableOpacity
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const slides = [
  {
    id: '0',
    title: 'Welcome to CIMS',
    description: 'Your platform for community improvement and civic engagement',
    icon: 'shield-checkmark-outline',
    color: '#7C3AED'  // Purple
  },
  {
    id: '1',
    title: 'Report Issues',
    description: 'Easily report civic issues in your area with photos and location',
    icon: 'warning-outline',
    color: '#FF6B6B'  // Warm red
  },
  {
    id: '2',
    title: 'Track Progress',
    description: 'Stay updated with real-time status updates on your reported issues',
    icon: 'analytics-outline',
    color: '#4ECDC4'  // Teal
  },
  {
    id: '3',
    title: 'Make a Difference',
    description: 'Help create a better community by actively participating in civic improvement',
    icon: 'people-outline',
    color: '#45B7D1'  // Blue
  }
];

const OnboardingScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index ?? 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = async () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      try {
        await AsyncStorage.setItem('onboardingComplete', 'true');
        navigation.replace('Login');
      } catch (err) {
        console.log('Error saving onboarding status:', err);
      }
    }
  };

  const skip = async () => {
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true');
      navigation.replace('Login');
    } catch (err) {
      console.log('Error saving onboarding status:', err);
    }
  };

  const Paginator = () => {
    return (
      <View style={styles.paginatorContainer}>
        {slides.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                { 
                  width: dotWidth,
                  opacity,
                  backgroundColor: theme.primary 
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    // Special styling for welcome slide
    const isWelcomeSlide = index === 0;

    return (
      <View style={[styles.slide, { width }]}>
        <Animated.View style={[
          styles.iconContainer,
          { 
            backgroundColor: item.color,
            transform: [{ scale }],
            opacity,
            ...(isWelcomeSlide && {
              width: 180,
              height: 180,
              borderRadius: 90,
            })
          }
        ]}>
          <Ionicons 
            name={item.icon} 
            size={isWelcomeSlide ? 90 : 80} 
            color="white" 
          />
        </Animated.View>
        <View style={styles.textContainer}>
          <Animated.Text 
            style={[
              styles.title, 
              { color: theme.text, opacity },
              isWelcomeSlide && { fontSize: 36 }
            ]}
          >
            {item.title}
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.description, 
              { color: theme.textSecondary, opacity }
            ]}
          >
            {item.description}
          </Animated.Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity 
        onPress={skip}
        style={styles.skipButton}
      >
        <Text style={[styles.skipText, { color: theme.textSecondary }]}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.flatlistContainer}>
        <FlatList
          data={slides}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      {/* Added wrapper for bottom elements */}
      <View style={styles.bottomContainer}>
        <Paginator />
        <TouchableOpacity
          style={[
            styles.button, 
            { 
              backgroundColor: theme.primary,
              shadowColor: theme.primary
            }
          ]}
          onPress={scrollTo}
        >
          <Text style={[styles.buttonText, { color: theme.surface }]}>
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatlistContainer: {
    flex: 3,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  paginatorContainer: {
    flexDirection: 'row',
    height: 40, // Reduced height
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Added margin bottom
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  button: {
    width: '100%', // Changed from absolute positioning
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottomContainer: {
    width: '100%',
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
});

export default OnboardingScreen;
