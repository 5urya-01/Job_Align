import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Animated,
  Image,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import axios from 'axios'; // Import axios for API calls
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
// Import expo modules for document picking and file system operations
import * as DocumentPicker from 'expo-document-picker'; // Corrected import statement
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');

const SkeletonLoader = ({ width = '100%', height = 20, style = {} }) => {
  const [shimmerAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={[{ width, height, backgroundColor: '#E1E9EE', borderRadius: 8, overflow: 'hidden' }, style]}>
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.6)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

const SkeletonJobDescription = () => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <SkeletonLoader width={20} height={20} style={{ borderRadius: 10 }} />
      <SkeletonLoader width={120} height={18} style={{ marginLeft: 8 }} />
    </View>
    <SkeletonLoader width="100%" height={16} style={{ marginBottom: 8 }} />
    <SkeletonLoader width="85%" height={16} style={{ marginBottom: 8 }} />
    <SkeletonLoader width="92%" height={16} style={{ marginBottom: 8 }} />
    <SkeletonLoader width="78%" height={16} />
  </View>
);

const SkeletonSkills = () => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <SkeletonLoader width={20} height={20} style={{ borderRadius: 10 }} />
      <SkeletonLoader width={140} height={18} style={{ marginLeft: 8 }} />
    </View>
    <View style={styles.skillsContainer}>
      {[...Array(6)].map((_, index) => (
        <SkeletonLoader
          key={index}
          width={Math.random() * 40 + 60}
          height={28}
          style={{ borderRadius: 20, marginRight: 8, marginBottom: 8 }}
        />
      ))}
    </View>
  </View>
);

const SkeletonResponsibilities = () => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <SkeletonLoader width={20} height={20} style={{ borderRadius: 10 }} />
      <SkeletonLoader width={140} height={18} style={{ marginLeft: 8 }} />
    </View>
    {[...Array(5)].map((_, index) => (
      <View key={index} style={styles.listItem}>
        <SkeletonLoader width={6} height={6} style={{ borderRadius: 3, marginTop: 8, marginRight: 12 }} />
        <SkeletonLoader width={`${Math.random() * 30 + 60}%`} height={16} />
      </View>
    ))}
  </View>
);

const SkeletonBenefits = () => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <SkeletonLoader width={20} height={20} style={{ borderRadius: 10 }} />
      <SkeletonLoader width={80} height={18} style={{ marginLeft: 8 }} />
    </View>
    {[...Array(5)].map((_, index) => (
      <View key={index} style={styles.benefitItem}>
        <SkeletonLoader width={20} height={20} style={{ borderRadius: 10 }} />
        <SkeletonLoader width={`${Math.random() * 40 + 50}%`} height={16} style={{ marginLeft: 12 }} />
      </View>
    ))}
  </View>
);

const JobListingInfoPage = ({ navigation, route }) => {
  // All useState and useEffect calls must be at the top level
  const { job, userId: initialUserId } = route.params;

  const [activeTab, setActiveTab] = useState('company');
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchAnalytics, setMatchAnalytics] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [matchError, setMatchError] = useState(null);
  const [loadingStage, setLoadingStage] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isUserIdLoading, setIsUserIdLoading] = useState(true);

  const API_BASE_URL = 'https://jobalign-backend.onrender.com/api';

  // Function to fetch job details - DEFINED HERE (before useEffect that calls it)
  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const requestBody = {
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        created: job.created,
        category: job.category,
        description: job.description,
        salary_is_predicted: job.salary_is_predicted || "0",
        Workplace_Model: job.Workplace_Model || "On-site",
        Work_Type: job.Work_Type || "Unspecified",
        Contract_Type: job.Contract_Type || "Unspecified",
        Experience_Level: job.Experience_Level || "fresher"
      };

      const response = await fetch(`${API_BASE_URL}/getJobDetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();

      const combinedJobDetails = {
        ...job,
        skills: data.skills || ['React', 'JavaScript', 'Node.js', 'MongoDB'],
        responsibilities: data.responsibilities || [
          "Develop and maintain React-based web applications",
          "Collaborate with design and backend teams",
          "Write clean, maintainable, and well-tested code",
          "Mentor junior developers",
          "Participate in code reviews and technical discussions"
        ],
        requirements: [
          `${job.Experience_Level === 'fresher' ? '0-2' : '3-5'}+ years of relevant experience`,
          "Strong proficiency in relevant technologies",
          `Experience with ${job.Work_Type || 'Full-time'} positions`,
          `Ability to work ${job.Workplace_Model || 'On-site'}`,
          "Strong problem-solving and communication skills"
        ],
        benefits: [
          "Competitive salary package",
          "Health and wellness benefits",
          "Professional development opportunities",
          "Flexible working arrangements",
          "Performance-based incentives"
        ]
      };

      setJobDetails(combinedJobDetails);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError(err.message);

      const fallbackJobDetails = {
        ...job,
        skills: ['React', 'JavaScript', 'Node.js', 'MongoDB'],
        responsibilities: [
          "Develop and maintain applications",
          "Collaborate with cross-functional teams",
          "Write clean, maintainable code",
          "Participate in code reviews",
          "Contribute to technical discussions"
        ],
        requirements: [
          `${job.Experience_Level === 'fresher' ? '0-2' : '3-5'}+ years of relevant experience`,
          "Strong technical skills",
          "Good communication abilities",
          "Team collaboration experience",
          "Problem-solving mindset"
        ],
        benefits: [
          "Competitive compensation",
          "Health benefits",
          "Professional growth opportunities",
          "Work-life balance",
          "Team collaboration"
        ],
        companyInfo: {
          about: job.description || "A dynamic company focused on innovation and growth.",
          size: "500-1000 employees",
          founded: "2015",
          industry: job.category || "Technology",
          website: job.url ? new URL(job.url).hostname : "www.company.com",
          culture: "Innovation-driven culture with focus on collaboration and growth."
        }
      };

      setJobDetails(fallbackJobDetails);
    } finally {
      setLoading(false);
    }
  };

  // Effect to load userId from AsyncStorage
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setCurrentUserId(storedUserId);
          console.log('User ID loaded from AsyncStorage:', storedUserId);
        } else if (initialUserId) {
          // Fallback to userId from route.params if not found in AsyncStorage
          setCurrentUserId(initialUserId);
          console.log('User ID from route.params:', initialUserId);
          // Optionally, save it to AsyncStorage for future use
          await AsyncStorage.setItem('userId', initialUserId);
        } else {
          // If no userId from either source, consider handling this case (e.g., generate new, prompt user)
          console.warn('No user ID found in AsyncStorage or route.params.');
          // Do not navigate back here. Instead, handle in the main render logic.
        }
      } catch (e) {
        console.error('Failed to load user ID from AsyncStorage', e);
        // Do not navigate back here. Handle in the main render logic.
      } finally {
        setIsUserIdLoading(false);
      }
    };

    loadUserId();
  }, [initialUserId]); // Dependency array should only include values that change and affect this effect

  // Effect to fetch job details
  useEffect(() => {
    // Only fetch job details if job object is available
    if (job) {
      fetchJobDetails();
    } else {
      // Instead of Alert, log and handle gracefully in UI if possible
      console.error('Job details are missing. Cannot fetch job details.');
      navigation.goBack(); // Navigate back if essential job data is missing
    }
  }, [job]); // Depend on job to re-run if it changes (though typically it's static for this page)

  // Conditional early return for loading states or missing critical data
  if (!job || isUserIdLoading || !currentUserId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0096C7" />
        <Text style={styles.loadingText}>
          {isUserIdLoading ? 'Loading user data...' : 'Loading essential job data...'}
        </Text>
      </View>
    );
  }

  const createSemiCirclePath = (percentage) => {
    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    const angle = (percentage / 100) * 180;
    const radians = (angle * Math.PI) / 180;
    const startX = centerX - radius;
    const startY = centerY;
    const endX = centerX + radius * Math.cos(Math.PI - radians);
    const endY = centerY - radius * Math.sin(Math.PI - radians);
    const largeArcFlag = angle > 90 ? 1 : 0;

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  const fetchMatchAnalytics = async () => {
    // Ensure currentUserId is available before making the call
    if (!currentUserId) {
      console.error('User ID not available to fetch match analytics.');
      setMatchError('User ID not available.'); // Set error for UI display
      return;
    }

    try {
      setLoadingMatch(true);
      setMatchError(null);
      setLoadingStage('Reading your resume...');

      const requestBody = {
        userId: currentUserId, // Use the dynamically loaded userId
        jobObject: {
          title: job.title,
          company: job.company,
          location: job.location,
          url: job.url,
          created: job.created,
          category: job.category,
          description: job.description,
          salary_is_predicted: job.salary_is_predicted || "0",
          Workplace_Model: job.Workplace_Model || "On-site",
          Work_Type: job.Work_Type || "Unspecified",
          Contract_Type: job.Contract_Type || "Unspecified",
          Experience_Level: job.Experience_Level || "fresher"
        }
      };

      // Log the request body for debugging purposes
      console.log('Sending match analytics request body:', requestBody);

      setTimeout(() => setLoadingStage('Analyzing job requirements...'), 1000);
      setTimeout(() => setLoadingStage('Calculating match score...'), 2000);
      setTimeout(() => setLoadingStage('Generating recommendations...'), 3000);

      const response = await fetch(`${API_BASE_URL}/getMatchAnalyticsFromMain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      setMatchAnalytics(data);
    } catch (err) {
      console.error('Error fetching match analytics:', err);
      setMatchError(err.message);

      // Mock data for demonstration on error
      const mockData = {
        matchPercentage: 75,
        matchedSkills: [
          "Java",
          "Python",
          "React.js",
          "Node.js",
          "Express.js",
          "MongoDB",
          "PostgreSQL",
          "Git"
        ],
        unmatchedSkills: [
          "AWS",
          "Docker",
          "RESTful APIs",
          "Kubernetes",
          "Agile",
          "Distributed Systems"
        ],
        improvementSuggestions: [
          "Obtain AWS Certified Developer certification",
          "Gain hands-on experience with Docker/Kubernetes",
          "Develop expertise in RESTful API design",
          "Contribute to large-scale open-source projects"
        ]
      };

      setMatchAnalytics(mockData);
    } finally {
      setLoadingMatch(false);
      setLoadingStage('');
    }
  };

  // Function to handle re-uploading resume
  const handleReUploadResume = async () => {
    // Ensure currentUserId is available before making the call
    if (!currentUserId) {
      console.error('User ID not available to re-upload resume.');
      setMatchError('User ID not available.'); // Set error for UI display
      return;
    }
    try {
      setLoadingMatch(true); // Start loading indicator as soon as action is initiated
      setLoadingStage('Opening file picker...'); // Inform user about file picker

      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf', // Specify PDF type
        copyToCacheDirectory: false, // Set to false, not needed if not reading as Base64
      });

      if (res.canceled) { // User cancelled the picker
        console.log('Resume upload was cancelled by the user.');
        setLoadingMatch(false);
        setLoadingStage('');
        return;
      }

      if (res.assets && res.assets.length > 0) {
        const pickedFile = res.assets[0];
        const resumeFileName = pickedFile.name;
        const resumeUri = pickedFile.uri;
        const resumeMimeType = pickedFile.mimeType; // Get the MIME type

        if (!job) {
          console.error('Job details not available for re-upload.');
          setMatchError('Job details not available for re-upload.');
          setLoadingMatch(false);
          setLoadingStage('');
          return;
        }

        // Parse jobObject from the original job prop to ensure it's a proper object
        const jobObjectToSend = {
          title: job.title,
          company: job.company,
          location: job.location,
          url: job.url,
          created: job.created,
          category: job.category,
          description: job.description,
          salary_is_predicted: job.salary_is_predicted || "0",
          Workplace_Model: job.Workplace_Model || "On-site",
          Work_Type: job.Work_Type || "Unspecified",
          Contract_Type: job.Contract_Type || "Unspecified",
          Experience_Level: job.Experience_Level || "fresher"
        };

        // Create FormData object
        const formData = new FormData();
        formData.append('userId', currentUserId);
        formData.append('jobObject', JSON.stringify(jobObjectToSend)); // Stringify complex objects
        
        // Append the file directly
        formData.append('resume', {
          uri: resumeUri,
          name: resumeFileName,
          type: resumeMimeType || 'application/pdf', // Provide a fallback MIME type
        });

        console.log('Sending re-upload resume FormData:', formData);
        setLoadingStage(`Uploading ${resumeFileName}...`);

        const response = await axios.post(
          `${API_BASE_URL}/getMatchAnalyticsFromTemp`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data', // IMPORTANT: Set content type for FormData
            },
          }
        );

        if (response.data) {
          setMatchAnalytics(response.data);
          // Instead of Alert, you can set a success message state to be displayed in UI
          console.log('Resume re-uploaded and analysis updated successfully!');
          setLoadingStage('Analysis updated!'); // Indicate success
        } else {
          console.error('API response was empty or malformed.');
          setMatchError('API response was empty or malformed.'); // Set error for UI
        }
      } else {
        console.warn('No file was selected for upload.');
        setMatchError('No file was selected.'); // Set error for UI
      }
    } catch (err) {
      console.error("Error during re-upload:", err);
      setMatchError(`Failed to re-upload resume: ${err.message || 'Unknown error'}`); // Set error for UI
    } finally {
      setLoadingMatch(false);
      // If there was an error, loadingStage will remain, otherwise it will clear.
      if (!matchError) {
        setLoadingStage('');
      }
    }
  };


  const handleApplyNow = () => {
    if (job.url) {
      Linking.openURL(job.url).catch(err => {
        console.error('Failed to open URL:', err);
        // Instead of Alert, use a UI message or toast
      });
    } else {
      // Instead of Alert, use a UI message or modal
      console.warn('No direct application link available for this position.');
    }
  };

  const handleGetMatchAnalysis = () => {
    fetchMatchAnalytics();
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    // Only fetch match analytics if userId is loaded and tab is 'resume'
    if (tab === 'resume' && !matchAnalytics && currentUserId) {
      fetchMatchAnalytics();
    }
  };

  const MatchAnalyticsLoader = () => (
    <View style={styles.loaderContainer}>
      <View style={styles.loaderContent}>
        <View style={styles.loaderAnimation}>
          <ActivityIndicator size="large" color="#0096C7" />
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
        <Text style={styles.loaderTitle}>Analyzing Your Resume</Text>
        <Text style={styles.loaderStage}>{loadingStage}</Text>
        <View style={styles.loaderSteps}>
          <View style={[styles.step, loadingStage.includes('resume') && styles.activeStep]}>
            <Ionicons name="document-text" size={16} color={loadingStage.includes('resume') ? '#0096C7' : '#ccc'} />
          </View>
          <View style={[styles.step, loadingStage.includes('requirements') && styles.activeStep]}>
            <Ionicons name="search" size={16} color={loadingStage.includes('requirements') ? '#0096C7' : '#ccc'} />
          </View>
          <View style={[styles.step, loadingStage.includes('score') && styles.activeStep]}>
            <Ionicons name="calculator" size={16} color={loadingStage.includes('score') ? '#0096C7' : '#ccc'} />
          </View>
          <View style={[styles.step, loadingStage.includes('recommendations') && styles.activeStep]}>
            <Ionicons name="bulb" size={16} color={loadingStage.includes('recommendations') ? '#0096C7' : '#ccc'} />
          </View>
        </View>
      </View>
    </View>
  );

  const SemiCircularProgress = ({ percentage }) => {
    const size = 140;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={styles.progressContainer}>
        <Svg width={size} height={size / 2 + 20} style={styles.progressSvg}>
          <Path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            stroke="#E8F5F9"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            stroke="#4CAF50"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
          />
          <Path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            stroke="rgba(76, 175, 80, 0.3)"
            strokeWidth={strokeWidth + 4}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
          />
        </Svg>

        <View style={styles.progressTextContainer}>
          <Text style={styles.progressPercentage}>{percentage}%</Text>
          <Text style={styles.progressLabel}>Match Score</Text>
        </View>
      </View>
    );
  };

  const renderResumeMatchContent = () => {
    if (loadingMatch) {
      return <MatchAnalyticsLoader />;
    }

    // Display error message if matchError is set
    if (matchError) {
      return (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Error</Text>
          </View>
          <Text style={styles.errorText}>
            {matchError}. Please try again or ensure your user ID is correct.
          </Text>
          <TouchableOpacity style={styles.getAnalysisButton} onPress={handleGetMatchAnalysis}>
              <Ionicons name="play-circle" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.getAnalysisButtonText}>Retry Analysis</Text>
            </TouchableOpacity>
        </View>
      );
    }

    if (!matchAnalytics) {
      return (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={20} color="#0096C7" />
            <Text style={styles.sectionTitle}>Resume Match Analysis</Text>
          </View>

          <View style={styles.getAnalysisContainer}>
            <Ionicons name="analytics" size={48} color="#0096C7" style={styles.analysisIcon} />
            <Text style={styles.getAnalysisTitle}>Get Your Resume Match Score</Text>
            <Text style={styles.getAnalysisDescription}>
              Analyze how well your resume matches this job posting and get personalized recommendations
            </Text>
            <TouchableOpacity style={styles.getAnalysisButton} onPress={handleGetMatchAnalysis}>
              <Ionicons name="play-circle" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.getAnalysisButtonText}>Analyze Resume Match</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={20} color="#0096C7" />
            <Text style={styles.sectionTitle}>Resume Match Analysis</Text>
          </View>

          <View style={styles.overallScoreContainer}>
            <SemiCircularProgress percentage={matchAnalytics.matchPercentage} />
          </View>

          {/* Changed "Re-analyze" to "Re-Upload Resume" and updated onPress */}
          <TouchableOpacity style={styles.retryButton} onPress={handleReUploadResume}>
            <Ionicons name="cloud-upload-outline" size={16} color="#0096C7" style={styles.buttonIcon} />
            <Text style={styles.retryButtonText}>Re-Upload Resume</Text>
          </TouchableOpacity>
        </View>

        {matchAnalytics.matchedSkills && matchAnalytics.matchedSkills.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Matched Skills</Text>
            </View>
            <View style={styles.skillsContainer}>
              {matchAnalytics.matchedSkills.map((skill, index) => (
                <View key={index} style={styles.matchedSkillTag}>
                  <Ionicons name="checkmark" size={12} color="#4CAF50" />
                  <Text style={styles.matchedSkillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {matchAnalytics.unmatchedSkills && matchAnalytics.unmatchedSkills.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="close-circle" size={20} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Skills to Develop</Text>
            </View>
            <View style={styles.skillsContainer}>
              {matchAnalytics.unmatchedSkills.map((skill, index) => (
                <View key={index} style={styles.unmatchedSkillTag}>
                  <Ionicons name="add" size={12} color="#FF6B6B" />
                  <Text style={styles.unmatchedSkillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {matchAnalytics.improvementSuggestions && matchAnalytics.improvementSuggestions.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb" size={20} color="#FFA726" />
              <Text style={styles.sectionTitle}>Improvement Suggestions</Text>
            </View>
            {matchAnalytics.improvementSuggestions.map((suggestion, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.suggestionBullet} />
                <Text style={styles.listItemText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}
      </>
    );
  };

  const renderCompanyInfoContent = () => {
    if (loading || !jobDetails) {
      return (
        <>
          {/* Job Description section now shows immediately */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color="#0096C7" />
              <Text style={styles.sectionTitle}>Job Description</Text>
            </View>
            <Text style={styles.descriptionText}>
              {job?.description || 'Loading job description...'}
            </Text>
          </View>

          {/* Keep skeletons for other sections */}
          <SkeletonSkills />
          <SkeletonResponsibilities />
          <SkeletonBenefits />
        </>
      );
    }

    return (
      <>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color="#0096C7" />
            <Text style={styles.sectionTitle}>Job Description</Text>
          </View>
          <Text style={styles.descriptionText}>
            {jobDetails.description || jobDetails.companyInfo?.about}
          </Text>
        </View>

        {jobDetails.skills && jobDetails.skills.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="code-slash" size={20} color="#0096C7" />
              <Text style={styles.sectionTitle}>Skills Required</Text>
            </View>
            <View style={styles.skillsContainer}>
              {jobDetails.skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color="#0096C7" />
            <Text style={styles.sectionTitle}>Responsibilities</Text>
          </View>
          {jobDetails.responsibilities.map((responsibility, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.listItemText}>{responsibility}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="gift" size={20} color="#0096C7" />
            <Text style={styles.sectionTitle}>Benefits</Text>
          </View>
          {jobDetails.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      </>
    );
  };

  return (
    <LinearGradient
      colors={['#90E0EF', '#CAF0F8', '#FFFFFF']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.8, y: 0.8 }}
      locations={[0, 0.4, 1]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.jobCard}>
          <View style={styles.jobHeader}>
            {job.logoUrl ? (
              <Image
                source={{ uri: job.logoUrl }}
                style={styles.companyLogo}
                resizeMode="contain"
              />
            ) : (
              <LinearGradient
                colors={['#0096C7', '#48CAE4']}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>
                  {job.company?.charAt(0).toUpperCase() || 'J'}
                </Text>
              </LinearGradient>
            )}

            <View style={styles.jobInfo}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <View style={styles.companyLocationContainer}>
                <View style={styles.companyRow}>
                  <Ionicons name="business-outline" size={12} color="#666" style={styles.infoIcon} />
                  <Text style={styles.companyText} numberOfLines={1}>{job.company}</Text>
                </View>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={12} color="#666" style={styles.infoIcon} />
                  <Text style={styles.locationText} numberOfLines={1}>{job.location}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            {job.Experience_Level && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{job.Experience_Level}</Text>
              </View>
            )}
            {job.Workplace_Model && job.Workplace_Model !== 'Unspecified' && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{job.Workplace_Model}</Text>
              </View>
            )}
            {job.Contract_Type && job.Contract_Type !== 'Unspecified' && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{job.Contract_Type}</Text>
              </View>
            )}
            {job.category && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{job.category}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.applyButton} onPress={handleApplyNow}>
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'company' && styles.activeTab]}
            onPress={() => handleTabPress('company')}
          >
            <Ionicons
              name="business-outline"
              size={20}
              color={activeTab === 'company' ? 'white' : '#0096C7'}
            />
            <Text style={[styles.tabText, activeTab === 'company' && styles.activeTabText]}>
              Job Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'resume' && styles.activeTab]}
            onPress={() => handleTabPress('resume')}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={activeTab === 'resume' ? 'white' : '#48CAE4'}
            />
            <Text style={[styles.tabText, activeTab === 'resume' && styles.activeTabText]}>
              Resume Match
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'resume' ? renderResumeMatchContent() : renderCompanyInfoContent()}

        <TouchableOpacity style={styles.bottomApplyButton} onPress={handleApplyNow}>
          <Text style={styles.applyButtonText}>Apply Now</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  jobCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  companyLocationContainer: {
    marginBottom: 4,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    marginRight: 4,
    width: 12,
  },
  companyText: {
    fontSize: 14,
    color: '#666',
    flexShrink: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    flexShrink: 1,
  },
  jobMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobType: {
    fontSize: 12,
    color: '#0096C7',
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#0096C7',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  applyButton: {
    backgroundColor: '#0096C7',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  activeTab: {
    backgroundColor: '#0096C7',
    borderColor: '#0096C7',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(240, 240, 240, 0.5)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
  },
  overallScoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  loaderContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(240, 240, 240, 0.5)',
    alignItems: 'center',
  },
  loaderContent: {
    alignItems: 'center',
    width: '100%',
  },
  loaderAnimation: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0096C7',
  },
  dot1: {
    opacity: 0.7,
  },
  dot2: {
    opacity: 0.5,
  },
  dot3: {
    opacity: 0.3,
  },
  loaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  loaderStage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loaderSteps: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  activeStep: {
    backgroundColor: '#E3F2FD',
    borderColor: '#0096C7',
    transform: [{ scale: 1.1 }],
  },
  getAnalysisContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  analysisIcon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  getAnalysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  getAnalysisDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  getAnalysisButton: {
    backgroundColor: '#0096C7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#0096C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  getAnalysisButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 20,
    height: 100,
    width: 140,
    alignSelf: 'center',
  },
  progressSvg: {
    position: 'absolute',
    top: 0,
  },
  progressTextContainer: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4CAF50',
    textAlign: 'center',
    textShadowColor: 'rgba(76, 175, 80, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  progressDecorations: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -5,
    gap: 4,
  },
  progressDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0096C7',
    backgroundColor: 'rgba(0, 150, 199, 0.05)',
    alignSelf: 'center',
    marginTop: 16,
  },
  retryButtonText: {
    color: '#0096C7',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 3,
  },
  matchedSkillTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  matchedSkillText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
    marginLeft: 4,
  },
  unmatchedSkillTag: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  unmatchedSkillText: {
    fontSize: 12,
    color: '#C62828',
    fontWeight: '500',
    marginLeft: 4,
  },
  suggestionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFA726',
    marginTop: 8,
    marginRight: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  skillTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0096C7',
    marginTop: 8,
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 12,
    lineHeight: 20,
  },
  bottomApplyButton: {
    backgroundColor: '#0096C7',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  bottomSpacer: {
    height: 20,
  },
  errorText: { // Added style for error messages
    fontSize: 14,
    color: '#C62828',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
  }
});

export default JobListingInfoPage;
