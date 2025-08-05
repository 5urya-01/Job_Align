import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../utils/theme';
import { authAPI } from "../../services/api";
import CustomAlert from '../../components/CustomAlert';

const { width } = Dimensions.get('window');

const OTPVerificationScreen = ({ navigation, route }) => {
  const { email, action, registrationData } = route.params || {};
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: []
  });

  // Create refs for each OTP input
  const inputRefs = useRef([]);

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
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (value, index) => {
    if (value.length <= 1 && /^\d*$/.test(value)) { // Only allow digits
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace to go to previous input
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      showAlert('Invalid OTP', 'Please enter a complete 6-digit OTP', 'error');
      return;
    }

    if (!/^\d{6}$/.test(otpString)) {
      showAlert('Invalid OTP', 'OTP must contain only numbers', 'error');
      return;
    }

    setLoading(true);

    try {
      const result = await authAPI.verifyOtp({
        email,
        otp: otpString,
      });
      
      if (result.success) {
        // Handle registration flow - create user after OTP verification
        if (action === 'register' && registrationData) {
          try {
            const createResult = await authAPI.createUser(registrationData);
            
            if (createResult.success) {
              showAlert(
                'Success!',
                createResult.message || 'Account created successfully!',
                'success',
                [{
                  text: 'OK',
                  onPress: () => navigation.navigate('Login')
                }]
              );
            } else {
              // Handle user creation errors
              let errorMessage = createResult.error || 'Account creation failed';
              
              switch (createResult.code) {
                case 'VALIDATION_ERROR':
                  errorMessage = 'Please check all fields and try again';
                  break;
                case 'EMAIL_EXISTS':
                  errorMessage = 'An account with this email already exists';
                  break;
                case 'WEAK_PASSWORD':
                  errorMessage = 'Password must be at least 6 characters long';
                  break;
                case 'INVALID_EMAIL':
                  errorMessage = 'Please enter a valid email address';
                  break;
                default:
                  errorMessage = createResult.error || 'Account creation failed. Please try again';
              }
              
              showAlert('Registration Failed', errorMessage, 'error');
            }
          } catch (error) {
            console.error('User creation error:', error);
            showAlert('Error', 'User creation failed. Please try again.', 'error');
          }
        } else if (action === 'forgot-password') {
          showAlert(
            'Success!',
            result.message || 'OTP verified successfully!',
            'success',
            [{
              text: 'OK',
              onPress: () => {
                navigation.navigate('ForgotPassword', { 
                  email, 
                  verified: true 
                });
              }
            }]
          );
        } else {
          navigation.navigate('Login');
        }
      } else {
        // Handle specific error codes
        let errorMessage = result.error || 'Invalid OTP';
        
        switch (result.code) {
          case 'VALIDATION_ERROR':
          case 'INVALID_OTP_FORMAT':
            errorMessage = 'Please enter a valid 6-digit OTP';
            break;
          case 'OTP_EXPIRED':
            errorMessage = 'OTP has expired. Please request a new one';
            break;
          case 'OTP_INVALID':
            errorMessage = 'Invalid OTP. Please check and try again';
            break;
          case 'MAX_ATTEMPTS_EXCEEDED':
            errorMessage = 'Too many failed attempts. Please request a new OTP';
            break;
          case 'USER_NOT_FOUND':
            errorMessage = 'User not found. Please check your email address';
            break;
          case 'NETWORK_ERROR':
            errorMessage = 'Network connection failed. Please check your internet connection';
            break;
          case 'TIMEOUT':
            errorMessage = 'Request timed out. Please try again';
            break;
          default:
            errorMessage = result.error || 'OTP verification failed. Please try again';
        }
        
        showAlert('Verification Failed', errorMessage, 'error');
        
        // Clear OTP inputs on failure
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      showAlert('Error', 'An unexpected error occurred. Please try again.', 'error');
      
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setResendLoading(true);

    try {
      const result = await authAPI.sendOtp({ email });
      
      if (result.success) {
        showAlert('Success!', result.message || 'OTP sent successfully!', 'success');
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        // Focus first input after resend
        inputRefs.current[0]?.focus();
      } else {
        // Handle specific error codes
        let errorMessage = result.error || 'Failed to send OTP';
        
        switch (result.code) {
          case 'VALIDATION_ERROR':
          case 'INVALID_EMAIL':
            errorMessage = 'Invalid email address';
            break;
          case 'USER_NOT_FOUND':
            errorMessage = 'No account found with this email address';
            break;
          case 'RATE_LIMITED':
            errorMessage = 'Too many requests. Please wait before trying again';
            break;
          case 'NETWORK_ERROR':
            errorMessage = 'Network connection failed. Please check your internet connection';
            break;
          case 'TIMEOUT':
            errorMessage = 'Request timed out. Please try again';
            break;
          default:
            errorMessage = result.error || 'Failed to send OTP. Please try again';
        }
        
        showAlert('Error', errorMessage, 'error');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      showAlert('Error', 'An unexpected error occurred. Please try again.', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>OTP Verification</Text>
              <Text style={styles.subtitle}>
                Enter the verification code we just sent on your email address
              </Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>

            {/* Form Container - No Card Background */}
            <View style={styles.formContainer}>
              {/* OTP Input */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => inputRefs.current[index] = ref}
                    style={[
                      styles.otpInput,
                      digit ? styles.otpInputFilled : null
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                    placeholderTextColor={colors.textMuted}
                    autoFocus={index === 0}
                    selectTextOnFocus={true}
                    editable={!loading && !resendLoading}
                  />
                ))}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[styles.verifyButton, (loading || resendLoading) && styles.disabledButton]}
                onPress={handleVerifyOtp}
                disabled={loading || resendLoading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify code</Text>
                )}
              </TouchableOpacity>

              {/* Resend Section */}
              <View style={styles.resendSection}>
                <Text style={styles.resendText}>
                  Didn't receive code? 
                </Text>
                {canResend ? (
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={resendLoading || loading}
                  >
                    <Text style={[styles.resendLink, (resendLoading || loading) && styles.disabledText]}>
                      {resendLoading ? 'Sending...' : 'Resend'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.timerText}>
                    Resend in {timer}s
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.white,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  emailText: {
    fontSize: fontSize.md,
    color: colors.white,
    fontWeight: fontWeight.semibold,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  formContainer: {
    paddingHorizontal: spacing.md,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  otpInput: {
    width: 45,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  otpInputFilled: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: fontWeight.medium,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  resendLink: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  disabledText: {
    opacity: 0.6,
  },
  timerText: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default OTPVerificationScreen;