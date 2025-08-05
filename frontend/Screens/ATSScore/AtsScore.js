import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  StatusBar,
  ImageBackground,
  SafeAreaView,
  Animated,
  Platform,
  Easing,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width, height } = Dimensions.get('window');

// Color palette
export const colors = {
  primary: '#0077B6',
  primaryDark: '#023E8A',
  secondary: '#48CAE4',
  accent: '#CAF0F8',
  background: '#CAF0F8',
  cardBackground: '#FFFFFF',
  lightBlue: '#ADE8F4',
  mediumBlue: '#90E0EF',
  darkBlue: '#03045E',
  text: '#03045E',
  textLight: '#023E8A',
  textMuted: '#0077B6',
  border: '#00B4D8',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  shadow: 'rgba(0, 119, 182, 0.15)',
  shadowDark: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  gradientBackground: ['#ADE8F4', '#CAF0F8'],
  gradientPrimary: ['#0077B6', '#0096C7'],
  mediumGray: '#E5E7EB',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const fontWeight = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 24 : 24,
    alignItems: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: width * 0.8,
  },
  uploadSection: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 32,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  stepContainer: {
    width: '100%',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  // New styles for ATS info section
  atsInfoSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    width: '100%',
  },
  atsInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  atsInfoCard: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  atsInfoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  atsInfoCardText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  atsStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  atsStatItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  atsStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  atsStatLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 8,
    width: '90%',
    justifyContent: 'space-between',
  },
  fileName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  analyzeButton: {
    backgroundColor: colors.success,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  analyzeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  // New styles for resume file info in loading screen
  loadingFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginTop: 16,
  },
  loadingFileName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  // New styles for loading progress steps
  loadingStepsContainer: {
    width: '100%',
    marginTop: 24,
  },
  loadingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  loadingStepActive: {
    backgroundColor: colors.accent,
  },
  loadingStepCompleted: {
    backgroundColor: '#F0FDF4',
  },
  loadingStepPending: {
    backgroundColor: '#F9FAFB',
  },
  loadingStepIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingStepText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  loadingStepTextActive: {
    color: colors.primary,
  },
  loadingStepTextCompleted: {
    color: colors.success,
  },
  loadingStepTextPending: {
    color: colors.textMuted,
  },
  resultsContainer: {
    width: '100%',
    maxWidth: 500,
  },
  scoreCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 32,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircleWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  scoreSummaryContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  scoreSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  scoreSummaryText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 24,
    width: '100%',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1, // Added to take remaining space
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listItemText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginTop: 16,
  },
  resetButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    marginRight: 12, // Increased margin for better spacing
  },
});

 const AtsScore = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const userId = "68506d63338e4380289ee276";

  const loadingSteps = [
    { text: 'Uploading resume file...', icon: 'cloud-upload' },
    { text: 'Parsing document content...', icon: 'document-text' },
    { text: 'Analyzing ATS compatibility...', icon: 'analytics' },
    { text: 'Generating recommendations...', icon: 'bulb' },
    { text: 'Finalizing results...', icon: 'checkmark-circle' }
  ];

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const LoadingScreen = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analyzing Your Resume</Text>
        <Text style={styles.loadingSubtext}>This may take a few moments...</Text>
        
        {/* Display selected file info */}
        {selectedFile && (
          <View style={styles.loadingFileInfo}>
            <Ionicons name="document" size={20} color={colors.primary} />
            <Text style={styles.loadingFileName}>{selectedFile.name}</Text>
          </View>
        )}

        {/* Loading progress steps */}
        <View style={styles.loadingStepsContainer}>
          {loadingSteps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            const isPending = index > currentStep;

            return (
              <View 
                key={index} 
                style={[
                  styles.loadingStep,
                  isCompleted && styles.loadingStepCompleted,
                  isActive && styles.loadingStepActive,
                  isPending && styles.loadingStepPending,
                ]}
              >
                <View style={styles.loadingStepIcon}>
                  <Ionicons 
                    name={isCompleted ? 'checkmark-circle' : step.icon} 
                    size={20} 
                    color={
                      isCompleted ? colors.success : 
                      isActive ? colors.primary : 
                      colors.textMuted
                    }
                  />
                </View>
                <Text style={[
                  styles.loadingStepText,
                  isCompleted && styles.loadingStepTextCompleted,
                  isActive && styles.loadingStepTextActive,
                  isPending && styles.loadingStepTextPending,
                ]}>
                  {step.text}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // New component for ATS information section
  const ATSInfoSection = () => {
    return (
      <View style={styles.atsInfoSection}>
        <Text style={styles.atsInfoTitle}>Why ATS Matters?</Text>
        
        <View style={styles.atsInfoCard}>
          <Text style={styles.atsInfoCardTitle}>Applicant Tracking System</Text>
          <Text style={styles.atsInfoCardText}>
            ATS software scans resumes for keywords, formatting, and structure before human recruiters see them.
          </Text>
        </View>

        <View style={styles.atsInfoCard}>
          <Text style={styles.atsInfoCardTitle}>Beat the Bots</Text>
          <Text style={styles.atsInfoCardText}>
            Our analyzer identifies issues that might cause ATS rejection and suggests improvements.
          </Text>
        </View>

        <View style={styles.atsInfoCard}>
          <Text style={styles.atsInfoCardTitle}>Increase Your Chances</Text>
          <Text style={styles.atsInfoCardText}>
            Optimize your resume format, keywords, and structure to pass ATS screening successfully.
          </Text>
        </View>

        <View style={styles.atsStatsContainer}>
          <View style={styles.atsStatItem}>
            <Text style={styles.atsStatNumber}>75%</Text>
            <Text style={styles.atsStatLabel}>Resumes Rejected by ATS</Text>
          </View>
          <View style={styles.atsStatItem}>
            <Text style={styles.atsStatNumber}>6</Text>
            <Text style={styles.atsStatLabel}>Seconds Average Review Time</Text>
          </View>
          <View style={styles.atsStatItem}>
            <Text style={styles.atsStatNumber}>98%</Text>
            <Text style={styles.atsStatLabel}>Fortune 500 Use ATS</Text>
          </View>
        </View>
      </View>
    );
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const analyzeResume = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    setIsLoading(true);
    setCurrentStep(0); // Reset loading steps

    try {
      const formData = new FormData();
      formData.append("userId", userId)
      
      if (selectedFile.file) {
        formData.append('resume', selectedFile.file, selectedFile.name);
      } else {
        formData.append('resume', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mimeType || 'application/pdf',
        });
      }

      const response = await axios.post(
        'https://jobalign-backend.onrender.com/api/getAtsAnalysis',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data) {
        const transformedResults = {
          score: Math.round(response.data.percentage) || 0,
          issues: Array.isArray(response.data.issues) ? response.data.issues : [],
          improvements: Array.isArray(response.data.improvements) ? response.data.improvements : [],
          strengths: Array.isArray(response.data.strengths) ? response.data.strengths : [],
          summary: response.data.summary || 'Your resume analysis is complete.',
        };
        setAnalysisResults(transformedResults);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to analyze resume. Please try again.');
    } finally {
      setIsLoading(false);
      setCurrentStep(0); // Reset steps
      setShowResults(true);
    }
  };

  const resetApp = () => {
    setSelectedFile(null);
    setIsLoading(false);
    setShowResults(false);
    setAnalysisResults(null);
    setCurrentStep(0);
  };

  const ScoreCard = ({ score, summary }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: score,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, [score]);

    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = animatedValue.interpolate({
      inputRange: [0, 100],
      outputRange: [circumference, 0],
    });

    const getScoreColor = (score) => {
      if (score >= 80) return colors.success;
      if (score >= 60) return colors.primary;
      if (score >= 40) return colors.warning;
      return colors.error;
    };

    return (
      <View style={styles.scoreCard}>
        <View style={styles.scoreCircleWrapper}>
          <Svg height="120" width="120" viewBox="0 0 120 120">
            <Circle
              stroke={colors.mediumGray}
              fill="none"
              cx="60"
              cy="60"
              r="45"
              strokeWidth="8"
            />
            <AnimatedCircle
              stroke={getScoreColor(score)}
              fill="none"
              cx="60"
              cy="60"
              r="45"
              strokeWidth="8"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </Svg>
          <View style={styles.scoreTextContainer}>
            <Text style={[styles.scoreNumber, { color: getScoreColor(score) }]}>
              {score}
            </Text>
          </View>
        </View>
        <Text style={styles.scoreLabel}>ATS COMPATIBILITY</Text>
        
        <View style={styles.scoreSummaryContainer}>
          <Text style={styles.scoreSummaryTitle}>Score Summary</Text>
          <Text style={styles.scoreSummaryText}>{summary}</Text>
        </View>
      </View>
    );
  };

  const ResultsCard = ({ title, items, iconName, iconColor }) => {
    return (
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name={iconName} size={24} color={iconColor} style={styles.sectionIcon} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        
        {items.length > 0 ? (
          items.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Ionicons name="ellipse" size={8} color={iconColor} style={{ marginTop: 6 }} />
              <Text style={styles.listItemText}>{item}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>
            {title === 'Issues' ? 'No significant issues found' : 
             title === 'Improvements' ? 'No improvements suggested' : 
             'No strengths analyzed'}
          </Text>
        )}
      </View>
    );
  };

  const ResultsDisplay = ({ analysisResults, resetApp }) => {
    if (!analysisResults) return null;

    const { score, summary, issues, improvements, strengths } = analysisResults;

    return (
      <ScrollView style={styles.resultsContainer}>
        <ScoreCard score={score} summary={summary} />
        
        <ResultsCard 
          title="Strengths" 
          items={strengths} 
          iconName="checkmark-circle" 
          iconColor={colors.success} 
        />
        
        <ResultsCard 
          title="Issues" 
          items={issues} 
          iconName="warning" 
          iconColor={colors.error} 
        />
        
        <ResultsCard 
          title="Improvements" 
          items={improvements} 
          iconName="bulb" 
          iconColor={colors.warning} 
        />

        <TouchableOpacity style={styles.resetButton} onPress={resetApp}>
          <Text style={styles.resetButtonText}>Analyze Another Resume</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ImageBackground 
        source={require('../../assets/background.png')} 
        style={styles.backgroundImage} 
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>ATS Resume Analyzer</Text>
            <Text style={styles.subtitle}>Get your resume past the robots and into human hands.</Text>
          </View>

          {isLoading ? (
            <LoadingScreen />
          ) : !showResults ? (
            <View style={styles.uploadSection}>
              {!selectedFile ? (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepTitle}>Upload Your Resume</Text>
                  <Text style={styles.stepDescription}>Select your resume file (PDF, DOCX) to begin the analysis.</Text>
                  <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
                    <Ionicons name="cloud-upload" size={24} color={colors.white} />
                    <Text style={styles.uploadButtonText}>Choose File</Text>
                  </TouchableOpacity>
                  
                  <ATSInfoSection />
                </View>
              ) : (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepTitle}>Ready for Analysis</Text>
                  <Text style={styles.stepDescription}>Your file is selected. Click 'Analyze' to proceed.</Text>
                  <View style={styles.fileInfo}>
                    <Ionicons name="document" size={20} color={colors.primary} />
                    <Text style={styles.fileName}>{selectedFile.name}</Text>
                    <TouchableOpacity onPress={resetApp}>
                      <Ionicons name="close-circle" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity 
                    style={styles.analyzeButton} 
                    onPress={analyzeResume} 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                    ) : (
                      <Text style={styles.analyzeButtonText}>Analyze Resume</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <ResultsDisplay 
              analysisResults={analysisResults} 
              resetApp={resetApp} 
            />
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

export default AtsScore;