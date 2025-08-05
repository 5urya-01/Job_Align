import React from 'react';
import { SafeAreaView, ActivityIndicator, View } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './utils/AuthContext';

// Screens
import BottomTabs from './Navigation/BottomTab';
import JobDetailsScreen from './Screens/Jobs/JobListingInfoPage';
import TrendingJobsDetails from './Screens/PopularJobs/TrendingJobsDetails';
import FilterScreen from './Screens/Jobs/FilterScreen';
import Roadmap from './Screens/DreamJob/Roadmap';
import WelcomeScreen from './Screens/Login/WelcomeScreen';
import LoginScreen from './Screens/Login/LoginScreen';
import RegisterScreen from './Screens/Login/RegisterScreen';
import OTPVerificationScreen from './Screens/Login/OTPVerificationScreen';
import ForgotPasswordScreen from './Screens/Login/ForgotPasswordScreen';
import AtsScore from './Screens/ATSScore/AtsScore';
import TopicList from './Screens/DreamJob/TopicList';
import ChatScreen from './Screens/ChatBot/chatscreen';
import Quiz from './Screens/DreamJob/Quiz';
import QuizResults from './Screens/DreamJob/QuizResults';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0096C7" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="MainApp"
              component={MainAppStack}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Auth"
              component={AuthStack}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const MainAppStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="BottomTab"
      component={BottomTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="JobDetail"
      component={JobDetailsScreen}
      options={{
        title: 'Job Details',
        headerStyle: {
          backgroundColor: '#0096C7',
        },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen
      name="TrendingJobsDetails"
      component={TrendingJobsDetails}
      options={{
        title: 'Job Information',
        headerStyle: {
          backgroundColor: '#90E0EF'

        },
      }}
    />
    <Stack.Screen
      name="FilterScreen"
      component={FilterScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Roadmap"
      component={Roadmap}
      options={{ headerShown: false }}
    />
     <Stack.Screen
      name="ATS"
      component={AtsScore}
    />
    <Stack.Screen
      name="Topics"
      component={TopicList}
    />
    <Stack.Screen
      name="Chatbot"
      component={ChatScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Quiz"
      component={Quiz}
    />
    <Stack.Screen
      name="QuizResults"
      component={QuizResults}
      options={{ headerShown: false }}
    />

  </Stack.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Welcome"
      component={WelcomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="OTPVerification"
      component={OTPVerificationScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Quiz"
      component={Quiz}
    />
    <Stack.Screen
      name="QuizResults"
      component={QuizResults}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0096C7" />
      </SafeAreaView>
    );
  }

  return (
    <AuthProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <AppContent />
      </SafeAreaView>
    </AuthProvider>
  );
}