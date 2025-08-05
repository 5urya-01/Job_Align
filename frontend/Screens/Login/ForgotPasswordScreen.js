import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../utils/theme';
import { authAPI } from "../../services/api";
import CustomAlert from '../../components/CustomAlert';

const { width } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation, route }) => {
  const { email: initialEmail, verified } = route.params || {};
  
  const [email, setEmail] = useState(initialEmail || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(verified ? 'reset' : 'email');
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: []
  });

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

  const handleInputChange = (field, value) => {
    if (field === 'email') setEmail(value);
    if (field === 'newPassword') setNewPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateEmail = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordReset = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    setErrors({}); // Clear any previous errors

    try {
      const result = await authAPI.sendOtp({ email: email.trim() });
      
      if (result.success) {
        showAlert(
          'Success!',
          result.message || 'OTP sent to your email address',
          'success',
          [{
            text: 'OK',
            onPress: () => {
              navigation.navigate('OTPVerification', { 
                email: email.trim(), 
                action: 'forgot-password' 
              });
            }
          }]
        );
      } else {
        // Handle specific error codes
        let errorMessage = result.error || 'Failed to send OTP';
        
        switch (result.code) {
          case 'VALIDATION_ERROR':
          case 'INVALID_EMAIL':
            errorMessage = 'Please enter a valid email address';
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
      console.error('Send OTP error:', error);
      showAlert('Error', 'An unexpected error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePasswordReset()) {
      return;
    }

    setLoading(true);
    setErrors({}); // Clear any previous errors

    try {
      const result = await authAPI.forgotPassword({
        email: email.trim(),
        password: newPassword,
      });
      
      if (result.success) {
        showAlert(
          'Success!',
          result.message || 'Password reset successfully!',
          'success',
          [{
            text: 'OK',
            onPress: () => {
              navigation.navigate('Login');
            }
          }]
        );
      } else {
        // Handle specific error codes
        let errorMessage = result.error || 'Failed to reset password';
        
        switch (result.code) {
          case 'VALIDATION_ERROR':
          case 'WEAK_PASSWORD':
            errorMessage = 'Password must be at least 6 characters long';
            break;
          case 'USER_NOT_FOUND':
            errorMessage = 'No account found with this email address';
            break;
          case 'INVALID_TOKEN':
            errorMessage = 'Reset session expired. Please request a new OTP';
            break;
          case 'NETWORK_ERROR':
            errorMessage = 'Network connection failed. Please check your internet connection';
            break;
          case 'TIMEOUT':
            errorMessage = 'Request timed out. Please try again';
            break;
          default:
            errorMessage = result.error || 'Failed to reset password. Please try again';
        }
        
        showAlert('Error', errorMessage, 'error');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showAlert('Error', 'An unexpected error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
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
              <Text style={styles.title}>
                {step === 'email' ? 'Forgot Password?' : 'Reset Password'}
              </Text>
              <Text style={styles.subtitle}>
                {step === 'email' 
                  ? 'Enter your email address to receive an OTP'
                  : 'Enter your new password'
                }
              </Text>
            </View>

            {/* Form Container - No Card Background */}
            <View style={styles.formContainer}>
              {step === 'email' ? (
                <>
                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Email"
                        value={email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholderTextColor={colors.textMuted}
                        editable={!loading}
                      />
                    </View>
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                  </View>

                  {/* Send OTP Button */}
                  <TouchableOpacity
                    style={[styles.actionButton, loading && styles.disabledButton]}
                    onPress={handleSendOtp}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.actionButtonText}>Send OTP</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* New Password Input */}
                  <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, errors.newPassword && styles.inputError]}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="New Password"
                        value={newPassword}
                        onChangeText={(value) => handleInputChange('newPassword', value)}
                        secureTextEntry={!showNewPassword}
                        placeholderTextColor={colors.textMuted}
                        editable={!loading}
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                        disabled={loading}
                      >
                        <Ionicons
                          name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color={colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
                  </View>

                  {/* Confirm Password Input */}
                  <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={(value) => handleInputChange('confirmPassword', value)}
                        secureTextEntry={!showConfirmPassword}
                        placeholderTextColor={colors.textMuted}
                        editable={!loading}
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                      >
                        <Ionicons
                          name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color={colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                  </View>

                  {/* Reset Password Button */}
                  <TouchableOpacity
                    style={[styles.actionButton, loading && styles.disabledButton]}
                    onPress={handleResetPassword}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.actionButtonText}>Reset Password</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {/* Back to Login Link */}
              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                <Text style={styles.loginLinkText}>
                  Remember your password? <Text style={styles.loginLinkBold}>Login</Text>
                </Text>
              </TouchableOpacity>
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  formContainer: {
    paddingHorizontal: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: spacing.md,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  textInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  eyeIcon: {
    padding: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.white,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
    fontWeight: fontWeight.semibold,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  actionButton: {
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
  actionButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: fontSize.sm,
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loginLinkBold: {
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});

export default ForgotPasswordScreen;

