import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
  Dimensions,
  StatusBar,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  Platform,
  RefreshControl, // Import RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Assuming background.png is in the correct assets path, if not this may cause an error.
import backgroundImage from '../../assets/background.png';
import * as DocumentPicker from 'expo-document-picker';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../utils/AuthContext';
import dreamCompaniesData from './CompaniesRolesData';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const Profile = ({ navigation }) => {
  const [userId, setUserId] = useState(null);
  const [updateData, setUpdateData] = useState(true);
  // User State
  const [userData, setUserData] = useState({
    dreamCompany: null,
    dreamRole: null,
    preferedRoles: [],
    preferedLocations: [],
    skills: [],
    applications: 0,
    interviews: 0,
    profileViews: 0,
    atsScore: 0,
    // Initialize resumeUrl for safe access
    resumeUrl: null,
  });

  // Modal States
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [dreamJobModalVisible, setDreamJobModalVisible] = useState(false);
  const [rolesModalVisible, setRolesModalVisible] = useState(false);
  const [locationsModalVisible, setLocationsModalVisible] = useState(false);
  const [skillsModalVisible, setSkillsModalVisible] = useState(false);
  const [resumePreviewVisible, setResumePreviewVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);

  // New state for dream job modal flow
  const [dreamJobModalView, setDreamJobModalView] = useState('company'); // 'company' or 'role'

  // Form States
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [pendingEmail, setPendingEmail] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  // Pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Search States
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [skillSearchQuery, setSkillSearchQuery] = useState('');

  // Refs
  const timerRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Predefined Options
  const colors = {
    primary: '#0ea5e9',
    primaryLight: '#38bdf8',
    primaryDark: '#0284c7',
    secondary: '#64748b',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    lightBlue: '#e0f2fe',
    lightBlue2: '#bae6fd',
    lightBlue3: '#7dd3fc',
    gradientStart: '#f0f9ff',
    gradientEnd: '#e0f2fe',
  };

  const availableRoles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'React Developer', 'Angular Developer', 'Vue.js Developer', 'Node.js Developer', 'Python Developer', 'Java Developer', 'C# Developer', 'PHP Developer', 'Ruby Developer', 'Go Developer', 'Rust Developer', 'Swift Developer', 'Kotlin Developer', 'Flutter Developer', 'React Native Developer', 'iOS Developer', 'Android Developer', 'DevOps Engineer', 'Cloud Engineer', 'Data Engineer', 'Data Scientist', 'Machine Learning Engineer', 'AI Engineer', 'QA Engineer', 'Test Automation Engineer', 'Security Engineer', 'Product Manager', 'Technical Writer', 'UI/UX Designer', 'Graphic Designer', 'Game Developer', 'Blockchain Developer',
  ];

  const availableLocations = [
    'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA', 'Los Angeles, CA', 'Chicago, IL', 'Denver, CO', 'Atlanta, GA', 'Miami, FL', 'Remote', 'Hybrid', 'Vizag', 'Chennai', 'Bangalore', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune', 'Kolkata', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubballi-Dharwad', 'Tiruchirappalli', 'Bareilly', 'Mysore', 'Tiruppur', 'Gurgaon', 'Aligarh', 'Jalandhar', 'Bhubaneswar', 'Salem', 'Warangal', 'Guntur', 'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Bikaner', 'Amravati', 'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad', 'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela', 'Nanded', 'Kolhapur', 'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu', 'Sangli-Miraj & Kupwad', 'Mangalore', 'Erode', 'Belgaum', 'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala', 'Kakinada',
  ];

  const availableSkills = [
    'React', 'Angular', 'Vue.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'SASS', 'LESS', 'Bootstrap', 'Tailwind CSS', 'Material-UI', 'Ant Design', 'Node.js', 'Express.js', 'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C#', '.NET', 'PHP', 'Laravel', 'Ruby', 'Ruby on Rails', 'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter', 'React Native', 'Ionic', 'Xamarin', 'Unity', 'Unreal Engine', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'Firebase', 'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'Terraform', 'Ansible', 'Chef', 'Puppet', 'Linux', 'Ubuntu', 'CentOS', 'Windows Server', 'Git', 'SVN', 'Mercurial', 'Jira', 'Confluence', 'Slack', 'Teams', 'Zoom', 'Figma', 'Adobe XD', 'Sketch', 'InVision', 'Photoshop', 'Illustrator', 'After Effects', 'Premiere Pro', 'Blender', 'Maya', '3ds Max', 'Cinema 4D', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Jupyter', 'R', 'MATLAB', 'Tableau', 'Power BI', 'Excel', 'Google Analytics', 'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing', 'Email Marketing', 'Copywriting', 'Technical Writing', 'Project Management', 'Agile', 'Scrum', 'Kanban', 'Lean', 'Six Sigma', 'ITIL', 'PMP', 'CSM', 'SAFe',
  ];

  // API Base URL
  const API_BASE_URL = 'https://jobalign-backend.onrender.com/api';

  // Axios instance
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });

  const { logout } = useAuth();
  const handleLogout = async () => {
    await logout();
  };

  const showToast = useCallback((message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  // Timer Effect
  useEffect(() => {
    if (otpTimer > 0) {
      timerRef.current = setTimeout(() => setOtpTimer(timer => timer - 1), 1000);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => clearTimeout(timerRef.current);
  }, [otpTimer]);

  // Toast Effect
  useEffect(() => {
    if (toastVisible) {
      toastTimeoutRef.current = setTimeout(() => setToastVisible(false), 3000);
    }
    return () => clearTimeout(toastTimeoutRef.current);
  }, [toastVisible]);
  
  // Get userId from AsyncStorage on component mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id !== null) {
          setUserId(id);
        } else {
          showToast('Could not find user credentials. Please log in again.', 'error');
        }
      } catch (error) {
        console.error("Failed to fetch userId from storage", error);
        showToast('Failed to load user credentials.', 'error');
      }
    };
    fetchUserId();
  }, []); // Runs once on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // API Functions
  const loadUserData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await api.post('/getUserData', { userId });
      console.log(response.data)
      if (response.data) {
        setUserData(response.data);
      } else {
        showToast(response.data?.message || 'Failed to load user data', 'error');
      }
    } catch (error) {
      showToast('Failed to load user data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false); // End refreshing animation
    }
  }, [userId]);
  
  // Load user data when userId is available or after an update (toast)
  useEffect(() => {
      loadUserData();
  }, [userId, toastVisible, loadUserData]);

  const updateUserDetails = useCallback(async (details) => {
    if (!userId) return false;
    try {
      setLoading(true);
      const response = await api.post('/updateUserDetails', { userId, ...details });
      if (response.data) {
        setUserData(prev => ({ ...prev, ...details }));
        showToast('Profile updated successfully!', 'success');
        return true;
      }
      showToast(response.data.message || 'Failed to update profile', 'error');
    } catch (error) {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
    return false;
  }, [userId]);

  const updateContactDetails = useCallback(async (details) => {
    if (!userId) return false;
    try {
      setLoading(true);
      const response = await axios.post(API_BASE_URL + '/updateContactDetails', {
        userId,
        ...details
      });

      if (response.data) {
        setUserData(prev => ({
          ...prev,
          ...details
        }));
        showToast('Contact details updated successfully!', 'success');
        return true;
      } else {
        showToast(response.data.message || 'Failed to update contact details', 'error');
      }
    } catch (error) {
      showToast('Failed to update contact details', 'error');
      console.error('Error updating contact details:', error);
    } finally {
      setLoading(false);
    }
    return false;
  }, [userId]);

  const updatePreferedRoles = useCallback(async (roles) => {
    if (!userId) return false;
    try {
      setLoading(true);
      if (roles.length > 5) {
        showToast('You can select a maximum of 5 preferred roles.', 'error');
        return false;
      }

      const response = await axios.post(API_BASE_URL + '/updatePreferedRoles', {
        userId,
        preferedRoles: roles,
      });

      if (response.data) {
        setUserData(prev => ({
          ...prev,
          preferedRoles: roles
        }));
        showToast('Preferred roles updated successfully!', 'success');
        return true;
      } else {
        showToast(response.data.message || 'Failed to update preferred roles', 'error');
      }
    } catch (error) {
      showToast('Failed to update preferred roles', 'error');
      console.error('Error updating preferred roles:', error);
    } finally {
      setLoading(false);
    }
    return false;
  }, [userId, showToast]);

  const updatePreferedLocations = useCallback(async (locations) => {
    if (!userId) return false;
    try {
      setLoading(true);
      if (locations.length > 5) {
        showToast('You can select a maximum of 5 preferred locations.', 'error');
        return false;
      }

      const response = await axios.post(API_BASE_URL + '/updatePreferedLocations', {
        userId,
        preferedLocations: locations,
      });

      if (response.data) {
        setUserData(prev => ({
          ...prev,
          preferedLocations: locations
        }));
        showToast('Preferred locations updated successfully!', 'success');
        return true;
      } else {
        showToast(response.data.message || 'Failed to update preferred locations', 'error');
      }
    } catch (error) {
      showToast('Failed to update preferred locations', 'error');
      console.error('Error updating preferred locations:', error);
    } finally {
      setLoading(false);
    }
    return false;
  }, [userId, showToast]);

  const sendOtp = useCallback(async (email) => {
    try {
      setLoading(true);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return false;
      }

      const response = await axios.post(API_BASE_URL + '/sendOtp', { email });

      if (response.data) {
        setOtpTimer(300); // 5 minutes
        showToast('Verification code sent to your email!', 'success');
        return true;
      } else {
        showToast(response.data.message || 'Failed to send verification code', 'error');
      }
    } catch (error) {
      showToast('Failed to send verification code', 'error');
      console.error('Error sending OTP:', error);
    } finally {
      setLoading(false);
    }
    return false;
  }, [showToast]);

  const verifyOtp = useCallback(async (email, otpCode) => {
    try {
      setLoading(true);
      if (!otpCode.trim()) {
        showToast('Please enter the verification code', 'error');
        return false;
      }

      if (otp.length !== 6) {
        showToast('Please enter a valid 6-digit code', 'error');
        return false;
      }

      const response = await axios.post(API_BASE_URL + '/verifyOtp', {
        email: email,
        otp: otpCode
      });

      if (response.data) {
        showToast("Email verified successfully!", "success");
        return true;
      } else {
        showToast(response.data.message || 'Invalid verification code', 'error');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      showToast('Verification failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
    return false;
  }, [otp, showToast]);

  const handleResumeUpload = useCallback(async () => {
    if (!userId) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      let fileInfo;
      if (result.assets && result.assets.length > 0) {
        fileInfo = result.assets[0];
      } else if (result.uri) {
        fileInfo = result;
      } else {
        showToast('Failed to select file', 'error');
        return;
      }

      setLoading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('userId', userId);

      const fileObject = {
        uri: fileInfo.uri,
        name: fileInfo.name || 'resume.pdf',
        type: fileInfo.mimeType || 'application/pdf',
      };

      formData.append('resume', fileObject);

      const uploadUrl = `${API_BASE_URL}/addResume`;

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentCompleted = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percentCompleted);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.resumeUrl || response.resumeScore || response.atsScore) {
              setUserData(prev => ({
                ...prev,
                ...(response.resumeUrl && { resumeUrl: response.resumeUrl }),
                ...(response.resumeScore && { resumeScore: response.resumeScore }),
                ...(response.atsScore && { atsScore: response.atsScore })
              }));
            }
            showToast('Resume uploaded successfully!', 'success');
          } catch (parseError) {
            showToast('Upload completed but response not parseable', 'info');
          }
        } else {
          showToast(`Upload failed with status ${xhr.status}`, 'error');
        }
        setLoading(false);
        setUploadProgress(0);
      };

      xhr.onerror = () => {
        showToast('Network request failed', 'error');
        setLoading(false);
        setUploadProgress(0);
      };

      xhr.open('POST', uploadUrl);
      xhr.timeout = 30000;
      xhr.send(formData);

    } catch (error) {
      showToast('Failed to upload resume', 'error');
      setLoading(false);
      setUploadProgress(0);
    }
  }, [userId, showToast]);


  const formatTimer = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Modal Handlers
  const openProfileModal = useCallback(() => {
    setEditData({ name: userData.name, role: userData.role, experienceLevel: userData.experienceLevel });
    setProfileModalVisible(true);
  }, [userData]);

  const openContactModal = useCallback(() => {
    setEditData({ email: userData.email, phone: userData.phone, location: userData.location });
    setContactModalVisible(true);
  }, [userData]);

  const openDreamJobModal = useCallback(() => {
    setEditData({
      selectedCompany: userData.dreamCompany || null,
      selectedRole: userData.dreamRole || null,
    });
    setCompanySearchQuery('');
    setRoleSearchQuery('');
    setDreamJobModalView('company'); // Reset view to company selection
    setDreamJobModalVisible(true);
  }, [userData.dreamCompany, userData.dreamRole]);

  const openRolesModal = useCallback(() => {
    setEditData({ selectedRoles: [...(userData.preferedRoles || [])] });
    setRoleSearchQuery('');
    setRolesModalVisible(true);
  }, [userData.preferedRoles]);

  const openLocationsModal = useCallback(() => {
    setEditData({ selectedLocations: [...(userData.preferedLocations || [])] });
    setLocationSearchQuery('');
    setLocationsModalVisible(true);
  }, [userData.preferedLocations]);

  const openSkillsModal = useCallback(() => {
    setEditData({ selectedSkills: [...(userData.skills || [])] });
    setSkillsModalVisible(true);
  }, [userData.skills]);

  // Save Handlers
  const saveProfile = useCallback(async () => {
    const success = await updateUserDetails(editData);
    if (success) setProfileModalVisible(false);
  }, [editData, updateUserDetails]);

  const saveContact = useCallback(async () => {
    if (!editData.email || !editData.phone) {
      showToast('Email and phone are required', 'error');
      return;
    }

    if (editData.email !== userData.email) {
      setPendingEmail(editData.email);
      const otpSent = await sendOtp(editData.email);
      if (otpSent) {
        setContactModalVisible(false);
        setOtpModalVisible(true);
      }
    } else {
      const success = await updateContactDetails(editData);
      if (success) {
        setContactModalVisible(false);
      }
    }
  }, [editData, userData.email, updateContactDetails, sendOtp, showToast]);

  const handleLogoutWithConfirmation = () => {
  Alert.alert(
    "Confirm Logout",
    "Are you sure you want to logout?",
    [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Logout",
        onPress: () => 
          handleLogout()
        ,
        style: "destructive" 
      }
    ],
    { cancelable: true } 
  );
};

  const saveDreamJob = useCallback(async () => {
    if (!userId) return;
    if (!editData.selectedCompany || !editData.selectedRole) {
      showToast('Please select both a company and a role.', 'error');
      return;
    }

    setLoading(true);

    try {
      const dreamJobPayload = {
        userId,
        company: editData.selectedCompany,
        role: editData.selectedRole,
      };

      const response = await api.post('/addDreamRole', dreamJobPayload);

      if (response.data) {
        setUserData(prev => ({
          ...prev,
          dreamCompany: editData.selectedCompany,
          dreamRole: editData.selectedRole,
        }));
        showToast('Dream job saved successfully!', 'success');
        setDreamJobModalVisible(false);
      } else {
        showToast(response.data.message || 'Failed to save dream job.', 'error');
      }
    } catch (error) {
      console.error('Error saving dream job:', error);
      showToast('An error occurred while saving. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [editData, showToast, userId]);


  const saveRoles = useCallback(async () => {
    if (!editData.selectedRoles || editData.selectedRoles.length === 0) {
      showToast('Please select at least one role', 'error');
      return;
    }
    if (editData.selectedRoles.length > 5) {
      showToast('You can select a maximum of 5 preferred roles.', 'error');
      return;
    }

    const success = await updatePreferedRoles(editData.selectedRoles);
    if (success) {
      setRolesModalVisible(false);
    }
  }, [editData, updatePreferedRoles, showToast]);

  const saveLocations = useCallback(async () => {
    if (!editData.selectedLocations || editData.selectedLocations.length === 0) {
      showToast('Please select at least one location', 'error');
      return;
    }
    if (editData.selectedLocations.length > 5) {
      showToast('You can select a maximum of 5 preferred locations.', 'error');
      return;
    }

    const success = await updatePreferedLocations(editData.selectedLocations);
    if (success) {
      setLocationsModalVisible(false);
    }
  }, [editData, updatePreferedLocations, showToast]);


  const saveSkills = useCallback(async () => {
    if (!editData.selectedSkills || editData.selectedSkills.length === 0) {
      showToast('Please select at least one skill', 'error');
      return;
    }
    if (editData.selectedSkills.length < 5 || editData.selectedSkills.length > 8) {
      showToast('You must select between 5 and 8 skills.', 'error');
      return;
    }

    const success = await updateUserDetails({
      skills: editData.selectedSkills,
    });

    if (success) {
      setSkillsModalVisible(false);
    }
  }, [editData, updateUserDetails, showToast]);

  const verifyEmailOtp = useCallback(async () => {
    if (!otp.trim()) {
      showToast('Please enter the verification code', 'error');
      return;
    }

    if (otp.length !== 6) {
      showToast('Please enter a valid 6-digit code', 'error');
      return;
    }

    const verified = await verifyOtp(pendingEmail, otp);
    if (verified) {
      const success = await updateContactDetails({
        ...editData,
        email: pendingEmail,
      });

      if (success) {
        setOtpModalVisible(false);
        setOtp('');
        setPendingEmail('');
        setOtpTimer(0);
      }
    }
  }, [otp, pendingEmail, verifyOtp, updateContactDetails, editData, showToast]);

  // Multi-select handlers
  const toggleSelection = (field, item, limit) => {
    const currentItems = editData[field] || [];
    const isSelected = currentItems.includes(item);
    let newItems;

    if (isSelected) {
      newItems = currentItems.filter(i => i !== item);
    } else {
      if (currentItems.length >= limit) {
        showToast(`You can select a maximum of ${limit} items.`, 'error');
        return;
      }
      newItems = [...currentItems, item];
    }
    setEditData(prev => ({ ...prev, [field]: newItems }));
  };

  const toggleRoleSelection = (role) => toggleSelection('selectedRoles', role, 5);
  const toggleLocationSelection = (location) => toggleSelection('selectedLocations', location, 5);
  const toggleSkillSelection = (skill) => toggleSelection('selectedSkills', skill, 8);


  // Render Functions
  const renderInput = ({ field, label, placeholder, icon, keyboardType = 'default' }) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
      <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
        <Icon name={icon} size={20} color={colors.secondary} style={styles.inputIcon} />
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          value={editData[field] || ''}
          onChangeText={(text) => setEditData(prev => ({ ...prev, [field]: text }))}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  const renderSearchBar = (searchQuery, setSearchQuery, placeholder) => (
    <View style={[styles.searchContainer, { borderColor: colors.border }]}>
      <Icon name="search" size={20} color={colors.secondary} style={styles.searchIcon} />
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );

  const renderMultiSelectItem = ({ item, isSelected, onToggle }) => (
    <TouchableOpacity
      style={[styles.multiSelectItem, { backgroundColor: isSelected ? colors.primary : colors.surface, borderColor: isSelected ? colors.primary : colors.border }]}
      onPress={() => onToggle(item)}
    >
      <Text style={[styles.multiSelectText, { color: isSelected ? colors.surface : colors.text }]}>{item}</Text>
      {isSelected && <Icon name="check" size={16} color={colors.surface} style={styles.checkIcon} />}
    </TouchableOpacity>
  );

  const renderSectionHeader = (title, icon, onEdit, editButtonText = 'Edit') => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <Icon name={icon} size={20} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <TouchableOpacity
        style={[styles.editButton, { backgroundColor: colors.lightBlue }]}
        onPress={onEdit}
      >
        <Icon name="edit-2" size={16} color={colors.primary} />
        <Text style={[styles.editButtonText, { color: colors.primary }]}>{editButtonText}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderToast = () => {
    if (!toastVisible) return null;
    const toastColor = toastType === 'success' ? colors.success : toastType === 'error' ? colors.error : colors.primary;
    return (
      <View style={[styles.toastContainer, { backgroundColor: toastColor }]}>
        <Icon name={toastType === 'success' ? 'check-circle' : 'x-circle'} size={20} color={colors.surface} />
        <Text style={[styles.toastText, { color: colors.surface }]}>{toastMessage}</Text>
      </View>
    );
  };

  const renderStatsCard = (icon, value, label, backgroundColor) => (
    <View style={[styles.statsCard, { backgroundColor }]}>
      <View style={[styles.statsIconContainer, { backgroundColor: colors.primary }]}>
        <Icon name={icon} size={24} color={colors.surface} />
      </View>
      <Text style={[styles.statsValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );

  const renderProgressBar = (percentage, color = colors.primary) => (
    <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
      <View
        style={[
          styles.progressBar,
          { width: `${percentage}%`, backgroundColor: color }
        ]}
      />
    </View>
  );

  // Function to handle pull-to-refresh
  const onPullToRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserData(); // Reload user data
  }, [loadUserData]);


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
              colors={['#90E0EF', '#CAF0F8', '#FFFFFF']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 0.8 }}
            locations={[0,0.4,1]}
      >

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onPullToRefresh}
            tintColor={colors.primary} // Color of the spinner
            colors={[colors.primaryLight]} // For Android
          />
        }
      >
        {/* Profile Header */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.lightBlue }]}>
              <Icon name="user" size={40} color={colors.primary} />
            </View>
            <View style={[styles.starBadge, { backgroundColor: colors.primary }]}>
              <Icon name="star" size={16} color={colors.surface} />
            </View>
          </View>

          <Text style={[styles.userName, { color: colors.text }]}>{userData.name}</Text>
          
          <View style={styles.roleExperienceRow}>
            <View style={[styles.infoBadge, { backgroundColor: colors.lightBlue }]}>
              <Icon name="briefcase" size={14} color={colors.primary} />
              <Text style={[styles.infoBadgeText, { color: colors.primary }]}>{userData.role}</Text>
            </View>
            <View style={[styles.infoBadge, { backgroundColor: colors.lightBlue }]}>
               <Icon name="trending-up" size={14} color={colors.primary} />
              <Text style={[styles.infoBadgeText, { color: colors.primary }]}>{userData.experienceLevel}</Text>
            </View>
          </View>


          <TouchableOpacity
            style={[styles.editProfileButton, { backgroundColor: colors.primary }]}
            onPress={openProfileModal}
          >
            <Icon name="edit-2" size={16} color={colors.surface} />
            <Text style={[styles.editProfileText, { color: colors.surface }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Information */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {renderSectionHeader('Contact Information', 'user', openContactModal)}

          <View style={[styles.contactItem, { backgroundColor: colors.lightBlue }]}>
            <Icon name="mail" size={20} color={colors.primary} />
            <Text style={[styles.contactText, { color: colors.text }]}>{userData.email}</Text>
          </View>

          <View style={[styles.contactItem, { backgroundColor: colors.lightBlue }]}>
            <Icon name="phone" size={20} color={colors.primary} />
            <Text style={[styles.contactText, { color: colors.text }]}>{userData.phone}</Text>
          </View>

          <View style={[styles.contactItem, { backgroundColor: colors.lightBlue }]}>
            <Icon name="map-pin" size={20} color={colors.primary} />
            <Text style={[styles.contactText, { color: colors.text }]}>{userData.location}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {renderStatsCard('file-text', userData.applications || 0, 'Applications', colors.lightBlue)}
          {renderStatsCard('calendar', userData.interviews || 0, 'Interviews', colors.lightBlue2)}
        </View>

        <View style={styles.statsGrid}>
          {renderStatsCard('eye', userData.profileViews || 0, 'Profile Views', colors.lightBlue)}
          {renderStatsCard('award', `${userData.atsScore}%`, 'Resume Score', colors.lightBlue2)}
        </View>

        {/* Dream Job */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {renderSectionHeader('Dream Job', 'target', openDreamJobModal, 'Edit')}

          {userData.dreamCompany && userData.dreamRole ? (
            <View style={styles.dreamJobContent}>
              <View style={styles.dreamJobSection}>
                <Text style={styles.dreamJobLabel}>Dream Role:</Text>
                <Text style={styles.dreamJobValue}>{userData.dreamRole}</Text>
              </View>

              <View style={styles.dreamJobSection}>
                <Text style={styles.dreamJobLabel}>Dream Company:</Text>
                <Text style={styles.dreamJobValue}>{userData.dreamCompany}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.dreamJobSubtitle}>
              Set your dream job to see personalized Roadmap
            </Text>
          )}

        </View>

        {/* Preferred Roles */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {renderSectionHeader('Preferred Roles', 'briefcase', openRolesModal, 'Edit')}

          <View style={styles.tagsContainer}>
            {userData.preferedRoles.length > 0 ? userData.preferedRoles.map((role, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: colors.lightBlue2 }]}>
                <Text style={[styles.tagText, { color: colors.primaryDark }]}>{role}</Text>
              </View>
            )) : <Text style={styles.dreamJobLabel}>Select Your Prefered Roles</Text>}
          </View>
        </View>

        {/* Preferred Locations */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {renderSectionHeader('Preferred Locations', 'map-pin', openLocationsModal, 'Edit')}

          <View style={styles.tagsContainer}>
            {userData.preferedLocations.length > 0 ? userData.preferedLocations.map((location, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: colors.lightBlue2 }]}>
                <Text style={[styles.tagText, { color: colors.primaryDark }]}>{location}</Text>
              </View>
            )) : <Text style={styles.dreamJobLabel}>Select Your Preferred Locations</Text>}
          </View>
        </View>

        {/* Resume & Portfolio */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="file-text" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Resume & Portfolio</Text>
            </View>
          </View>

          <View style={styles.resumeScoreContainer}>
            <Text style={[styles.resumeScoreLabel, { color: colors.text }]}>Resume Score</Text>
            <Text style={[styles.resumeScoreValue, { color: colors.primary }]}>{userData.atsScore}%</Text>
          </View>

          {renderProgressBar(userData.atsScore)}

          <View style={styles.resumeButtonsContainer}>
            <TouchableOpacity
              style={[styles.resumeButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (userData.resumeUrl) {
                  setResumePreviewVisible(true);
                } else {
                  showToast('No resume uploaded yet', 'info');
                }
              }}
            >
              <Icon name="eye" size={16} color={colors.surface} />
              <Text style={[styles.resumeButtonText, { color: colors.surface }]}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resumeButton, { backgroundColor: colors.lightBlue3 }]}
              onPress={handleResumeUpload}
              disabled={loading}
            >
              <Icon name="upload" size={16} color={colors.primaryDark} />
              <Text style={[styles.resumeButtonText, { color: colors.primaryDark }]}>
                {loading ? 'Uploading...' : 'Update'}
              </Text>
            </TouchableOpacity>
          </View>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <View style={styles.uploadProgressContainer}>
              <Text style={[styles.uploadProgressText, { color: colors.textSecondary }]}>
                Uploading... {uploadProgress}%
              </Text>
              {renderProgressBar(uploadProgress, colors.success)}
            </View>
          )}
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogoutWithConfirmation} // Changed from handleLogout
        >
          <Icon name="log-out" size={16} color={colors.surface} />
          <Text style={[styles.logoutButtonText, { color: colors.surface }]}>Logout</Text>
        </TouchableOpacity>


      </ScrollView>
      </LinearGradient>

      {/* Profile Edit Modal */}
      <Modal visible={profileModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setProfileModalVisible(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setProfileModalVisible(false)}><Icon name="x" size={24} color={colors.text} /></TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
            <TouchableOpacity onPress={saveProfile}><Text style={[styles.saveButton, { color: colors.primary }]}>Save</Text></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {renderInput({ field: 'name', label: 'Full Name', placeholder: 'Enter your full name', icon: 'user' })}
            {renderInput({ field: 'role', label: 'Current Role', placeholder: 'Enter your current role', icon: 'briefcase' })}
            {renderInput({ field: 'experienceLevel', label: 'Experience Level', placeholder: 'Enter your experience level', icon: 'trending-up' })}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Contact Edit Modal */}
      <Modal
        visible={contactModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setContactModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setContactModalVisible(false)}>
              <Icon name="x" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Contact</Text>
            <TouchableOpacity onPress={saveContact} disabled={loading}>
              <Text style={[styles.saveButton, { color: colors.primary }]}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {renderInput({
              field: 'email',
              label: 'Email Address',
              placeholder: 'Enter your email',
              icon: 'mail',
              keyboardType: 'email-address',
            })}

            {renderInput({
              field: 'phone',
              label: 'Phone Number',
              placeholder: 'Enter your phone number',
              icon: 'phone',
              keyboardType: 'phone-pad',
            })}

            {renderInput({
              field: 'location',
              label: 'Location',
              placeholder: 'Enter your location',
              icon: 'map-pin',
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Dream Job Edit Modal */}
      <Modal
        visible={dreamJobModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDreamJobModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            {dreamJobModalView === 'role' ? (
              <TouchableOpacity onPress={() => setDreamJobModalView('company')}>
                <Icon name="arrow-left" size={24} color={colors.text} />
              </TouchableOpacity>
            ) : <View style={{ width: 24 }} />}
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {dreamJobModalView === 'company' ? 'Select Company' : 'Select Role'}
            </Text>
            <TouchableOpacity onPress={saveDreamJob} disabled={loading}>
              <Text style={[styles.saveButton, { color: colors.primary }]}>{loading ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {dreamJobModalView === 'company' ? (
              <>
                {renderSearchBar(companySearchQuery, setCompanySearchQuery, 'Search companies...')}
                <FlatList
                  data={dreamCompaniesData.filter(c => c && c.company && c.company.toLowerCase().includes(companySearchQuery.toLowerCase()))}
                  keyExtractor={(item, index) => `${item.company}-${index}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.multiSelectItem, {
                        backgroundColor: editData.selectedCompany === item.company ? colors.primary : colors.surface,
                        borderColor: editData.selectedCompany === item.company ? colors.primary : colors.border,
                      }]}
                      onPress={() => {
                        setEditData(prev => ({ ...prev, selectedCompany: item.company, selectedRole: null }));
                        setDreamJobModalView('role');
                        setRoleSearchQuery('');
                      }}
                    >
                      <Text style={[styles.multiSelectText, { color: editData.selectedCompany === item.company ? colors.surface : colors.text }]}>
                        {item.company}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            ) : (
              <>
                {renderSearchBar(roleSearchQuery, setRoleSearchQuery, 'Search roles...')}
                <FlatList
                  data={dreamCompaniesData.find(c => c.company === editData.selectedCompany)?.roles.filter(r => r && r.toLowerCase().includes(roleSearchQuery.toLowerCase())) || []}
                  keyExtractor={(item, index) => `${item}-${index}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.multiSelectItem, {
                        backgroundColor: editData.selectedRole === item ? colors.primary : colors.surface,
                        borderColor: editData.selectedRole === item ? colors.primary : colors.border,
                      }]}
                      onPress={() => setEditData(prev => ({ ...prev, selectedRole: item }))}
                    >
                      <Text style={[styles.multiSelectText, { color: editData.selectedRole === item ? colors.surface : colors.text }]}>{item}</Text>
                      {editData.selectedRole === item && <Icon name="check" size={16} color={colors.surface} style={styles.checkIcon} />}
                    </TouchableOpacity>
                  )}
                />
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Preferred Roles Modal */}
      <Modal
        visible={rolesModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setRolesModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setRolesModalVisible(false)}>
              <Icon name="x" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Preferred Roles ({editData.selectedRoles?.length || 0}/5)
            </Text>
            <TouchableOpacity onPress={saveRoles} disabled={loading}>
              <Text style={[styles.saveButton, { color: colors.primary }]}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {renderSearchBar(roleSearchQuery, setRoleSearchQuery, 'Search roles...')}

            <FlatList
              data={availableRoles.filter(role =>
                role && role.toLowerCase().includes(roleSearchQuery.toLowerCase())
              )}
              keyExtractor={(item) => item}
              style={{ flex: 1 }}
              renderItem={({ item }) => renderMultiSelectItem({
                item,
                isSelected: editData.selectedRoles?.includes(item),
                onToggle: toggleRoleSelection,
                type: 'role'
              })}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Preferred Locations Modal */}
      <Modal
        visible={locationsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setLocationsModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setLocationsModalVisible(false)}>
              <Icon name="x" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Preferred Locations ({editData.selectedLocations?.length || 0}/5)
            </Text>
            <TouchableOpacity onPress={saveLocations} disabled={loading}>
              <Text style={[styles.saveButton, { color: colors.primary }]}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {renderSearchBar(locationSearchQuery, setLocationSearchQuery, 'Search locations...')}

            <FlatList
              data={availableLocations.filter(location =>
                location && location.toLowerCase().includes(locationSearchQuery.toLowerCase())
              )}
              keyExtractor={(item) => item}
              style={{ flex: 1 }}
              renderItem={({ item }) => renderMultiSelectItem({
                item,
                isSelected: editData.selectedLocations?.includes(item),
                onToggle: toggleLocationSelection,
                type: 'location'
              })}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Resume Preview Modal */}
      <Modal
        visible={resumePreviewVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setResumePreviewVisible(false)}
      >
        <ImageBackground
          source={backgroundImage}
          style={styles.container}
          resizeMode="cover"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={[styles.previewHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
              <Text style={[styles.previewTitle, { color: colors.text }]}>Resume Preview</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setResumePreviewVisible(false)}
              >
                <Icon name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.previewContent}>
              {userData?.resumeUrl ? ( // Use optional chaining for safety
                <Image
                  source={{ uri: userData.resumeUrl }}
                  style={styles.resumeImage}
                  resizeMode="contain" // 'contain' is great for documents
                />
              ) : (
                <View style={styles.noResumeContainer}>
                  <Icon name="file-text" size={64} color={colors.border} />
                  <Text style={[styles.noResumeText, { color: colors.textSecondary }]}>
                    No resume uploaded yet
                  </Text>
                </View>
              )}
            </View>
          </SafeAreaView>
        </ImageBackground>
      </Modal>

      {/* OTP Verification Modal */}
      <Modal
        visible={otpModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setOtpModalVisible(false)}>
              <Icon name="x" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Verify Email</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.modalContent}>
            <View style={styles.otpContainer}>
              <Icon name="mail" size={48} color={colors.primary} style={styles.otpIcon} />
              <Text style={[styles.otpTitle, { color: colors.text }]}>Check your email</Text>
              <Text style={[styles.otpSubtitle, { color: colors.textSecondary }]}>
                We've sent a verification code to {pendingEmail}
              </Text>

              <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                <Icon name="key" size={20} color={colors.secondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: colors.text, textAlign: 'center' }]}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              {otpTimer > 0 && (
                <Text style={[styles.timerText, { color: colors.textSecondary }]}>
                  Resend code in {formatTimer(otpTimer)}
                </Text>
              )}

              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }
                ]}
                onPress={verifyEmailOtp}
                disabled={loading || !otp.trim()}
              >
                {loading ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={[styles.verifyButtonText, { color: colors.surface }]}>
                    Verify Email
                  </Text>
                )}
              </TouchableOpacity>

              {otpTimer === 0 && (
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={() => sendOtp(pendingEmail)}
                >
                  <Text style={[styles.resendButtonText, { color: colors.primary }]}>
                    Resend Code
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Modal>


      {renderToast()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    marginVertical: 8,
    marginTop: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16, // Adjusted margin
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  editProfileText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dreamJobSection: {
    marginBottom: 12,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  dreamJobContent: {
    marginTop: 8,
  },
  dreamJobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  }, dreamJobValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 22,
  },
  dreamJobSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginTop: 8,
  },
  dreamJobLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resumeScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resumeScoreLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  resumeScoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  resumeButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  resumeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  resumeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  uploadProgressContainer: {
    marginTop: 16,
  },
  uploadProgressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12, // Platform specific padding
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
  },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingBottom: 12, marginBottom: 12 },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16 },
  multiSelectItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  multiSelectText: { fontSize: 16, flex: 1 },
  checkIcon: { marginLeft: 8 },
  toastContainer: { position: 'absolute', top: 100, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, zIndex: 1000, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 8 },
  toastText: { fontSize: 16, fontWeight: '500', marginLeft: 12, flex: 1 },
  roleExperienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  infoBadgeText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
  },
  // --- Logout Button Styles ---
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginVertical: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // --- Resume Preview Modal Styles ---
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  previewContent: {
    flex: 1, // Crucial: Allows the content to fill the remaining space
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumeImage: {
    flex: 1, // Crucial: Makes the image expand to fill the 'previewContent'
    width: '100%',
    height: '100%',
  },
  noResumeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResumeText: {
    marginTop: 16,
    fontSize: 16,
  },
   otpContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  otpIcon: {
    marginBottom: 20,
  },
  otpTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  timerText: {
    marginTop: 20,
    fontSize: 14,
  },
  verifyButton: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    marginTop: 20,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Profile;
