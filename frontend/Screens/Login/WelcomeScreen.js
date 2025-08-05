import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ImageBackground,
  Platform,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../utils/theme';
import CustomAlert from '../../components/CustomAlert';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: []
  });

  const [animationLoaded, setAnimationLoaded] = useState(false);
  const [animationError, setAnimationError] = useState(false);
  const animationRef = useRef(null);

  const showAlert = (title, message, type = 'info', buttons = []) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      buttons
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    // Small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      if (animationRef.current && animationLoaded) {
        animationRef.current.play();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [animationLoaded]);

  const handleAnimationLoaded = () => {
    console.log('Welcome animation loaded successfully');
    setAnimationLoaded(true);
    setAnimationError(false);
  };

  const handleAnimationFailure = (error) => {
    console.log('Welcome animation failed to load:', error);
    setAnimationError(true);
    setAnimationLoaded(false);
  };

  const handleAnimationFinish = () => {
    console.log('Welcome animation finished');
    // Optionally restart the animation or perform other actions
  };

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>

          {/* Lottie Animation Container */}
          <View style={styles.animationContainer}>
            {!animationError ? (
              <LottieView
                ref={animationRef}
                source={require('../../assets/Welcome.json')}
                autoPlay={true}
                loop={true}
                style={styles.lottieAnimation}
                resizeMode="contain"
                speed={1.0}
                // Improved platform-specific configuration
                renderMode={Platform.OS === 'android' ? 'SOFTWARE' : 'AUTOMATIC'}
                hardwareAccelerationAndroid={Platform.OS === 'android' ? false : true}
                // Event handlers
                onAnimationFinish={handleAnimationFinish}
                onAnimationLoaded={handleAnimationLoaded}
                onAnimationFailure={handleAnimationFailure}
                // Additional props for better performance
                cacheComposition={true}
                colorFilters={[]}
              />
            ) : (
              // Fallback content when animation fails
              <View style={styles.fallbackContainer}>
                <Text style={styles.fallbackText}>🎉</Text>
                <Text style={styles.fallbackSubtext}>Welcome!</Text>
              </View>
            )}
          </View>

          {/* Text and Buttons */}
          <View style={styles.contentContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Discover Your{'\n'}Dream Job here</Text>
              <Text style={styles.subtitle}>
                Explore all the existing job roles based on your
                interest and study major
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.8}
              >
                <Text style={styles.registerButtonText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          buttons={alertConfig.buttons}
          onClose={hideAlert}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  animationContainer: {
    flex: 2.2,
    alignItems: 'center',
    justifyContent: 'center',

    // paddingTop: spacing.xs,
    // Increased minimum height for larger animation
    minHeight: width * 0.8,
  },
  lottieAnimation: {
    // Increased animation size from 0.8 to 1.1 (37.5% larger)
    width: width * 1.1,
    height: width * 1.1,
    marginTop:-50,
    backgroundColor: 'transparent',
  },
  // Fallback styles when animation fails
  fallbackContainer: {
    width: width * 1.1,
    height: width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.lg,
  },
  fallbackText: {
    fontSize: fontSize.xxl * 2,
    marginBottom: spacing.sm,
  },
  fallbackSubtext: {
    fontSize: fontSize.xl,
    color: colors.white,
    fontWeight: fontWeight.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  contentContainer: {
    flex: 1.3,
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
    
    // Move content up by 10% of screen height
    transform: [{ translateY: -height * 0.15 }],
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'center',
    lineHeight: fontSize.xxl * 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.white,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.4,
    paddingHorizontal: spacing.sm,
    fontWeight: fontWeight.medium,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xxl*1.1,
  },
  loginButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  registerButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonText: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
});

export default WelcomeScreen;