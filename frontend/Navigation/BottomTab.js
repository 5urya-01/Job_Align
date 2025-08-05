import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, Text, Animated } from 'react-native';

import HomeScreen from '../Screens/Home/HomeScreen';
import JobListings from '../Screens/Jobs/JobListings';
import Profile from '../Screens/Profile/Profile';
import Trending_Page from '../Screens/PopularJobs/Trending_Page';
import DreamJobInfo from '../Screens/DreamJob/Deamjobinfo';

const Tab = createBottomTabNavigator();

// Enhanced tab icon component with smooth transitions and circles
const EnhancedTabIcon = ({ focused, iconName, color, label }) => {
  const scaleValue = React.useRef(new Animated.Value(focused ? 1 : 0.9)).current;

  React.useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1 : 0.9,
      useNativeDriver: true,
      tension: 120,
      friction: 7,
    }).start();
  }, [focused]);

  return (
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center',
      paddingVertical: 6,
      minHeight: 70,
      flex: 1,
    }}>
      <Animated.View style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        marginBottom: 2,
        transform: [{ scale: scaleValue }],
        backgroundColor: focused ? '#E3F2FD' : 'transparent',
        borderRadius: 22,
      }}>
        <Ionicons 
          name={iconName} 
          size={22} 
          color={focused ? '#1976D2' : '#757575'} 
        />
      </Animated.View>
      
      <Text style={{
        color: focused ? '#1976D2' : '#9E9E9E',
        fontSize: 10,
        fontWeight: focused ? '600' : '500',
        textAlign: 'center',
        letterSpacing: 0.1,
        marginTop: 0,
        lineHeight: 12,
        maxWidth: '100%',
      }}>
        {label}
      </Text>
    </View>
  );
};

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1976D2',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 95 : 80,
          backgroundColor: '#FAFAFA',
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 25 : 15,
          paddingTop: 10,
          paddingHorizontal: 8,
          elevation: 12,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopColor: '#E0E0E0',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          // display: 'none',
        },
        tabBarItemStyle: {
          height: 65,
          paddingVertical: 4,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 18,
          marginHorizontal: 2,
        },
        // Remove visual feedback effects while keeping touch functionality
        tabBarPressColor: 'transparent',
        tabBarPressOpacity: 1,
        tabBarButton: (props) => {
          const { TouchableOpacity } = require('react-native');
          return (
            <TouchableOpacity
              {...props}
              style={[
                props.style,
                {
                  backgroundColor: 'transparent',
                }
              ]}
              activeOpacity={1}
              underlayColor="transparent"
            />
          );
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          let label;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              // label = 'Home';
              break;
            case 'Popular':
              iconName = focused ? 'trending-up' : 'trending-up-outline';
              // label = 'Top';
              break;
            case 'Jobs':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              // label = 'Jobs';
              break;
            case 'DreamJob':
              iconName = focused ? 'star' : 'star-outline';
              // label = 'Dream';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              // label = 'Profile';
              break;
            default:
              iconName = 'ellipse-outline';
              label = 'Tab';
          }

          return (
            <EnhancedTabIcon 
              focused={focused} 
              iconName={iconName} 
              color={color}
              label={label}
            />
          );
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          tabBarAccessibilityLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Popular" 
        component={Trending_Page}
        options={{ 
          tabBarAccessibilityLabel: 'Popular',
        }}
      />
      <Tab.Screen 
        name="Jobs" 
        component={JobListings}
        options={{ 
          tabBarAccessibilityLabel: 'Jobs',
        }}
      />
      <Tab.Screen 
        name="DreamJob" 
        component={DreamJobInfo}
        options={{ 
          tabBarAccessibilityLabel: 'Dream Job',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={Profile}
        options={{ 
          tabBarAccessibilityLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}