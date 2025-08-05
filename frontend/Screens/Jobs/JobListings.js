import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  // Alert, // Removed Alert as per instructions - use custom modal if needed
  Image,
  FlatList,
  RefreshControl,
  Animated,
  Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import debounce from 'lodash.debounce'; // Import debounce

const { width } = Dimensions.get('window');

const DEFAULT_IT_FILTERS = {
  "Companies": [
    "Amazon",
    "Google",
    "Microsoft",
    "Infosys"
  ],
  "roles": [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Machine Learning Engineer",
    "Full Stack Developer"
  ],
  "Locations": [
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Mumbai"
  ],
  "Work_Type": [
    "Full-Time",
    "Part-Time",
    "Internship",
    "Freelance",
    "Temporary"
  ],
  "Contract_Type": [
    "Permanent",
    "Contract",
    "Temporary",
    "Fixed-Term"
  ],
  "Experience_Level": [
    "fresher",
    "experienced"
  ],
  "Workplace_Model": [
    "On-site",
    "Remote",
    "Hybrid"
  ]
};

// Skeleton Card component for loading state
const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonCardContent}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonJobInfo}>
          <View style={[styles.skeletonLine, { width: '70%' }]} />
          <View style={[styles.skeletonLine, { width: '90%', marginTop: 8 }]} />
          <View style={[styles.skeletonLine, { width: '40%', marginTop: 8 }]} />
        </View>
      </View>
      <View style={styles.skeletonTags}>
        <View style={[styles.skeletonTag, { width: 80 }]} />
        <View style={[styles.skeletonTag, { width: 60 }]} />
        <View style={[styles.skeletonTag, { width: 90 }]} />
      </View>
      <View style={styles.skeletonFooter}>
        <View style={[styles.skeletonLine, { width: '30%' }]} />
        <View style={[styles.skeletonLine, { width: '25%' }]} />
      </View>
    </View>
  </View>
);

// Skeleton Loader component for multiple skeleton cards
const SkeletonLoader = () => (
  <View style={styles.skeletonContainer}>
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </View>
);

const JobListings = ({ navigation, route }) => { // Add route to props
  const [searchQuery, setSearchQuery] = React.useState('');
  const [jobData, setJobData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [totalJobCount, setTotalJobCount] = React.useState(0);
  const [usingDefaultFilters, setUsingDefaultFilters] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [hasMoreJobs, setHasMoreJobs] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [refreshing, setRefreshing] = React.useState(false);

  // Animated value for FlatList scroll position
  const scrollY = React.useRef(new Animated.Value(0)).current;
  // Animated value for the scroll to top button's translate Y position
  const scrollToTopButtonAnim = React.useRef(new Animated.Value(0)).current;
  const flatListRef = React.useRef(null);

  const [baseFilters, setBaseFilters] = React.useState({
    selectedRoles: [],
    selectedLocations: []
  });

  const [userAppliedFilters, setUserAppliedFilters] = React.useState({
    selectedLocation: null,
    selectedRoles: [],
    selectedCompanies: [],
    selectedWorkType: null,
    selectedContractType: null,
    selectedExperience: null,
    selectedWorkplace: null,
  });

  const API_BASE_URL = 'https://jobalign-backend.onrender.com/api';
  const USER_ID = "68506d63338e4380289ee276";

  // Debounced search query handler
  const debouncedSetSearchQuery = React.useCallback(
    debounce((text) => setSearchQuery(text), 300),
    []
  );

  // Filter categories for the filter screen
  const filterCategories = [
    {
      id: 'companies',
      label: 'Companies',
      searchable: true,
      items: [
        "Amazon", "Google", "Microsoft", "Infosys", "TCS", "Wipro",
        "Accenture", "IBM", "Oracle", "SAP", "Adobe", "Salesforce",
        "Netflix", "Apple", "Meta", "Tesla", "Uber", "Airbnb",
        "Cognizant", "HCL", "Mindtree", "L&T Infotech", "Mphasis",
        "Capgemant", "DXC Technology", "Deloitte", "PwC", "EY", "KPMG"
      ]
    },
    {
      id: 'roles',
      label: 'Roles',
      searchable: true,
      items: [
        "Software Engineer", "Frontend Developer", "Backend Developer",
        "Full Stack Developer", "Machine Learning Engineer", "Data Scientist",
        "DevOps Engineer", "Mobile Developer", "UI/UX Designer", "Product Manager",
        "QA Engineer", "Data Analyst", "Cloud Architect", "Cybersecurity Specialist",
        "Senior Software Engineer", "Lead Software Engineer", "Principal Software Engineer",
        "React Developer", "Angular Developer", "Vue.js Developer", "Node.js Developer",
        "Python Developer", "Java Developer", "C++ Developer", "iOS Developer", "Android Developer"
      ]
    },
    {
      id: 'location',
      label: 'Location',
      searchable: true,
      items: [
        "Bangalore", "Hyderabad", "Chennai", "Mumbai", "Pune", "Delhi",
        "Gurgaon", "Noida", "Kolkata", "Ahmedabad", "Kochi", "Thiruvananthapuram",
        "Jaipur", "Indore", "Bhopal", "Nagpur", "Coimbatore", "Mysore"
      ]
    },
    {
      id: 'workType',
      label: 'Work Type',
      searchable: false,
      items: ["Full-Time", "Part-Time", "Internship", "Freelance", "Temporary"]
    },
    {
      id: 'contractType',
      label: 'Contract Type',
      searchable: false,
      items: ["Permanent", "Contract", "Temporary", "Fixed-Term"]
    },
    {
      id: 'experience',
      label: 'Experience',
      searchable: false,
      items: ["fresher", "experienced"]
    },
    {
      id: 'workplace',
      label: 'Workplace',
      searchable: false,
      items: ["On-site", "Remote", "Hybrid"]
    }
  ];

  // Animated FlatList component
  const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

  // Function to fetch user's preferred filters from API
  const fetchUserFilters = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/getUserFilters`, {
        userId: USER_ID
      });
      return {
        preferredRoles: response.data.data?.preferredRoles || DEFAULT_IT_FILTERS.roles,
        preferredLocations: response.data.data?.preferredLocations || DEFAULT_IT_FILTERS.Locations
      };
    } catch (error) {
      console.error('Error fetching user filters:', error);
      return {
        preferredRoles: DEFAULT_IT_FILTERS.roles,
        preferredLocations: DEFAULT_IT_FILTERS.Locations
      };
    }
  };

  // Function to fetch jobs from API
  const fetchJobs = async (filters = {}, page = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);

      // Determine which filters to use based on 'usingDefaultFilters' state
      const filtersToUse = usingDefaultFilters
        ? {
          selectedRoles: baseFilters.selectedRoles || [],
          selectedLocations: baseFilters.selectedLocations || [],
          ...filters
        }
        : filters;

      // Construct API payload for filters
      const apiFilters = {
        roles: filtersToUse.selectedRoles || [],
        Locations: filtersToUse.selectedLocation ? [filtersToUse.selectedLocation] : (filtersToUse.selectedLocations || []),
        Companies: filtersToUse.selectedCompanies || [],
        Work_Type: filtersToUse.selectedWorkType ? [filtersToUse.selectedWorkType] : [],
        Contract_Type: filtersToUse.selectedContractType ? [filtersToUse.selectedContractType] : [],
        Experience_Level: filtersToUse.selectedExperience ? [filtersToUse.selectedExperience] : [],
        Workplace_Model: filtersToUse.selectedWorkplace ? [filtersToUse.selectedWorkplace] : [],
        page: page,
        limit: 10
      };

      const requestBody = {
        userId: USER_ID,
        filters: apiFilters
      };

      const response = await axios.post(`${API_BASE_URL}/getFilteredJobs`, requestBody);

      if (!response.data || !response.data.jobs) {
        throw new Error('Invalid response structure from server');
      }

      // Append or set job data based on whether it's a load more call
      if (isLoadMore) {
        setJobData(prevJobs => [...prevJobs, ...(response.data.jobs || [])]);
      } else {
        setJobData(response.data.jobs || []);
      }

      // Update total job count from API response
      setTotalJobCount(response.data.count || 0);

      // Determine if there are more jobs to load
      const totalPages = Math.ceil(response.data.count / 10);
      setHasMoreJobs(page < totalPages);

    } catch (err) {
      console.error('Fetch Jobs Error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load jobs. Please try again.';
      setError(errorMessage);

      if (jobData.length === 0) {
        setJobData([]);
      }
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
      setRefreshing(false);
    }
  };

  // Callback for refreshing the job list
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMoreJobs(true);
    fetchJobs(usingDefaultFilters ? baseFilters : userAppliedFilters, 1);
  }, [usingDefaultFilters, baseFilters, userAppliedFilters]);

  // Function to load more jobs when scrolling near the end
  const loadMoreJobs = () => {
    if (!isLoadingMore && hasMoreJobs) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchJobs(usingDefaultFilters ? baseFilters : userAppliedFilters, nextPage, true);
    }
  };

  // Function to scroll to the top of the FlatList
  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // Effect to manage the animation of the scroll-to-top button
  React.useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      if (value > 200) { // If scrolled down past 200 units
        // Animate button in (to translateY 0, which is mapped from buttonAnim 1)
        Animated.timing(scrollToTopButtonAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start();
      } else {
        // Animate button out (to translateY 100, which is mapped from buttonAnim 0)
        Animated.timing(scrollToTopButtonAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start();
      }
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Interpolate the Animated.Value to control the button's translateY for smooth animation
  const buttonTranslateY = scrollToTopButtonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0], // 100 means off-screen (bottom), 0 means on-screen
  });


  // Function to format time ago for job posting date
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently posted';

    try {
      const jobDate = new Date(dateString);
      const now = new Date();
      const diffInMs = now - jobDate;
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInDays <= 0) return 'Today';
      if (diffInDays === 1) return '1 day ago';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
      return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
    } catch (error) {
      return 'Recently posted';
    }
  };

  // Handler for applying filters from the filter screen
  const handleApplyFilters = (newFilters) => {
    setUsingDefaultFilters(false);
    setUserAppliedFilters(newFilters);
    setCurrentPage(1);
    setHasMoreJobs(true);
    fetchJobs(newFilters, 1);
  };

  // Handler for clearing all applied filters
  const handleClearFilters = () => {
    setUsingDefaultFilters(true);
    setUserAppliedFilters({
      selectedLocation: null,
      selectedRoles: [],
      selectedCompanies: [],
      selectedWorkType: null,
      selectedContractType: null,
      selectedExperience: null,
      selectedWorkplace: null,
    });
    setSearchQuery(''); // Clear search query when filters are cleared
    setCurrentPage(1);
    setHasMoreJobs(true);
    fetchJobs(baseFilters, 1); // Refetch with initial base filters
  };

  // Function to remove a single filter tag
  const removeFilter = (filterType, value) => {
    if (usingDefaultFilters && (filterType === 'role' || filterType === 'location')) {
      const newBaseFilters = { ...baseFilters };

      if (filterType === 'role') {
        newBaseFilters.selectedRoles = newBaseFilters.selectedRoles.filter(r => r !== value);
      } else if (filterType === 'location') {
        newBaseFilters.selectedLocations = newBaseFilters.selectedLocations.filter(l => l !== value);
      }

      setBaseFilters(newBaseFilters);
      setCurrentPage(1);
      setHasMoreJobs(true);
      fetchJobs(newBaseFilters, 1);
    } else {
      const newFilters = { ...userAppliedFilters };

      switch (filterType) {
        case 'company':
          newFilters.selectedCompanies = newFilters.selectedCompanies.filter(c => c !== value);
          break;
        case 'role':
          newFilters.selectedRoles = newFilters.selectedRoles.filter(r => r !== value);
          break;
        case 'location':
          newFilters.selectedLocation = null;
          break;
        case 'workType':
          newFilters.selectedWorkType = null;
          break;
        case 'contractType':
          newFilters.selectedContractType = null;
          break;
        case 'experience':
          newFilters.selectedExperience = null;
          break;
        case 'workplace':
          newFilters.selectedWorkplace = null;
          break;
      }

      setUserAppliedFilters(newFilters);
      setCurrentPage(1);
      setHasMoreJobs(true);
      fetchJobs(newFilters, 1);
    }
  };

  // Function to get active filter tags for display
  const getActiveFilterTags = () => {
    const tags = [];

    // Add default filters if active
    if (usingDefaultFilters) {
      if (baseFilters.selectedRoles && baseFilters.selectedRoles.length > 0) {
        baseFilters.selectedRoles.forEach(role => {
          tags.push({ type: 'role', value: role, label: role });
        });
      }

      if (baseFilters.selectedLocations && baseFilters.selectedLocations.length > 0) {
        baseFilters.selectedLocations.forEach(location => {
          tags.push({ type: 'location', value: location, label: location });
        });
      }
    }

    // Add user-applied filters
    if (userAppliedFilters.selectedCompanies && userAppliedFilters.selectedCompanies.length > 0) {
      userAppliedFilters.selectedCompanies.forEach(company => {
        tags.push({ type: 'company', value: company, label: company });
      });
    }

    if (userAppliedFilters.selectedRoles && userAppliedFilters.selectedRoles.length > 0) {
      userAppliedFilters.selectedRoles.forEach(role => {
        tags.push({ type: 'role', value: role, label: role });
      });
    }

    if (userAppliedFilters.selectedLocation) {
      tags.push({ type: 'location', value: userAppliedFilters.selectedLocation, label: userAppliedFilters.selectedLocation });
    }

    if (userAppliedFilters.selectedWorkType) {
      tags.push({ type: 'workType', value: userAppliedFilters.selectedWorkType, label: userAppliedFilters.selectedWorkType });
    }

    if (userAppliedFilters.selectedContractType) {
      tags.push({ type: 'contractType', value: userAppliedFilters.selectedContractType, label: userAppliedFilters.selectedContractType });
    }

    if (userAppliedFilters.selectedExperience) {
      tags.push({ type: 'experience', value: userAppliedFilters.selectedExperience, label: userAppliedFilters.selectedExperience });
    }

    if (userAppliedFilters.selectedWorkplace) {
      tags.push({ type: 'workplace', value: userAppliedFilters.selectedWorkplace, label: userAppliedFilters.selectedWorkplace });
    }

    return tags;
  };

  // Function to navigate to the filter screen
  const openFilterScreen = () => {
    navigation.navigate('FilterScreen', {
      currentFilters: {
        ...userAppliedFilters,
        // Pass baseFilters roles/locations if default filters are active
        ...(usingDefaultFilters ? {
          selectedRoles: baseFilters.selectedRoles,
          selectedLocations: baseFilters.selectedLocations
        } : {})
      },
      filterCategories: filterCategories,
      onApplyFilters: handleApplyFilters,
      onClearFilters: handleClearFilters,
      defaultFilters: DEFAULT_IT_FILTERS
    });
  };

  // Function to navigate to job detail screen
  const handleJobPress = (job) => {
    navigation.navigate('JobDetail', { job });
  };

  // Render function for individual job cards
  const renderJobCard = ({ item: job, index }) => (
    <TouchableOpacity
      key={`${job.id || index}`} // Use job.id if available, fallback to index
      style={styles.jobCard}
      onPress={() => handleJobPress(job)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.jobHeader}>
          {job.logoUrl ? (
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: job.logoUrl }}
                style={styles.companyLogo}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {job.company ? job.company.charAt(0) : '?'}
              </Text>
            </View>
          )}
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <View style={styles.companyRow}>
              <Ionicons name="business" size={12} color="#666" style={styles.infoIcon} />
              <Text style={styles.companyText} numberOfLines={1}>{job.company}</Text>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={12} color="#666" style={styles.infoIcon} />
              <Text style={styles.locationText} numberOfLines={1}>{job.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tagsContainer}>
          {job.Workplace_Model && job.Workplace_Model !== 'Unspecified' && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{job.Workplace_Model}</Text>
            </View>
          )}
          {job.Experience_Level && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{job.Experience_Level}</Text>
            </View>
          )}
          {job.Work_Type && job.Work_Type !== 'Unspecified' && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{job.Work_Type}</Text>
            </View>
          )}
        </View>

        <View style={styles.jobFooter}>
          <View style={styles.timeContainer}>
            <View style={styles.timeIndicator} />
            <Text style={styles.timeText}>{formatTimeAgo(job.created)}</Text>
          </View>
          <Text style={styles.detailsText}>View details</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Initial fetch of user filters and jobs on component mount
  React.useEffect(() => {
    const initializeFiltersAndFetchJobs = async () => {
      try {
        setLoading(true);
        setCurrentPage(1);
        setHasMoreJobs(true);

        const preselectedRole = route.params?.preselectedRole; // Get preselectedRole

        if (preselectedRole) {
          // If preselectedRole exists, apply it and clear other filters
          const newFilters = {
            selectedLocation: null,
            selectedRoles: [preselectedRole], // Set only the preselected role
            selectedCompanies: [],
            selectedWorkType: null,
            selectedContractType: null,
            selectedExperience: null,
            selectedWorkplace: null,
          };
          setUserAppliedFilters(newFilters);
          setUsingDefaultFilters(false);
          setSearchQuery(''); // Clear any existing search query
          await fetchJobs(newFilters, 1);
        } else {
          // Otherwise, proceed with existing logic (fetch user filters or use defaults)
          const { preferredRoles, preferredLocations } = await fetchUserFilters();
          const newBaseFilters = {
            selectedRoles: preferredRoles,
            selectedLocations: preferredLocations
          };
          setBaseFilters(newBaseFilters);
          setUsingDefaultFilters(true);
          await fetchJobs({
            selectedRoles: preferredRoles,
            selectedLocations: preferredLocations
          }, 1);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeFiltersAndFetchJobs();
  }, [route.params?.preselectedRole]); // Re-run effect if preselectedRole changes

  const activeFilterTags = getActiveFilterTags();

  // Conditional rendering for content based on loading, error, and job data state
  const renderContent = () => {
    if (loading) {
      return <SkeletonLoader />;
    }

    if (error && jobData.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>Failed to load jobs</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchJobs(usingDefaultFilters ? baseFilters : userAppliedFilters, 1)}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Filter jobs client-side based on search query and user-applied filters
    const filteredJobs = jobData.filter((job) => {
      // Apply search query filter first
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          job.title?.toLowerCase().includes(query) ||
          job.company?.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Apply user-applied filters if not using default filters
      if (!usingDefaultFilters) {
        const { selectedCompanies, selectedRoles, selectedLocation, ...otherFilters } = userAppliedFilters;

        if (selectedCompanies.length > 0 && !selectedCompanies.includes(job.company)) {
          return false;
        }

        // Check if job.title is one of the selected roles
        if (selectedRoles.length > 0 && !selectedRoles.some(role => job.title.includes(role))) {
          return false;
        }

        if (selectedLocation && job.location !== selectedLocation) {
          return false;
        }

        if (otherFilters.selectedWorkType && job.Work_Type !== otherFilters.selectedWorkType) {
          return false;
        }
        if (otherFilters.selectedContractType && job.Contract_Type !== otherFilters.selectedContractType) {
          return false;
        }
        if (otherFilters.selectedExperience && job.Experience_Level !== otherFilters.selectedExperience) {
          return false;
        }
        if (otherFilters.selectedWorkplace && job.Workplace_Model !== otherFilters.selectedWorkplace) {
          return false;
        }
      }

      return true; // Keep the job if it passes all active filters
    });

    // If no jobs found after filtering
    if (filteredJobs.length === 0 && !loading && !isLoadingMore) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="search" size={48} color="#999" />
                <Text style={styles.noJobsText}>
                    {searchQuery || activeFilterTags.length > 0 ? 'No jobs found matching your criteria' : 'No jobs available'}
                </Text>
            </View>
        );
    }


    // Sort jobs to bring those with logos to the top (optional visual preference)
    // FIX: The following sort is removed to prevent the list from jumping to the top when loading more items.
    const sortedJobData = filteredJobs;

    return (
      <>
        <AnimatedFlatList
          ref={flatListRef}
          data={sortedJobData}
          renderItem={renderJobCard}
          keyExtractor={(item, index) => `${item.id || index}-${index}`} // Unique key for each item
          contentContainerStyle={styles.scrollContent}
          onEndReached={loadMoreJobs}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0096C7']}
              tintColor={'#0096C7'}
            />
          }
          // Pass scroll events to Animated.Value for tracking scroll position
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } }}],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16} // Adjust throttle for smoother updates
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#0096C7" />
              </View>
            ) : !hasMoreJobs && jobData.length > 0 && !searchQuery && activeFilterTags.length === 0 ? ( // Only show "No more jobs" if no search/filters
              <View style={styles.allLoadedContainer}>
                <Text style={styles.allLoadedText}>No more jobs to show</Text>
              </View>
            ) : null
          }
        />

        {/* Scroll to Top Button - Controlled by buttonTranslateY animation */}
        <Animated.View style={[styles.scrollToTopButton, { transform: [{ translateY: buttonTranslateY }] }]}>
          <TouchableOpacity onPress={scrollToTop} style={styles.scrollToTopTouchable}>
            <Ionicons name="arrow-up" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </>
    );
  };

  // Determine the displayed job count
  // If there's a search query or user filters are active, use the length of filteredJobs.
  // Otherwise, use the totalJobCount from the API.
  const displayedJobCount = (searchQuery || !usingDefaultFilters) ?
    jobData.filter((job) => {
      // Re-apply client-side filter logic to get accurate count for display
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          job.title?.toLowerCase().includes(query) ||
          job.company?.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (!usingDefaultFilters) {
        const { selectedCompanies, selectedRoles, selectedLocation, ...otherFilters } = userAppliedFilters;

        if (selectedCompanies.length > 0 && !selectedCompanies.includes(job.company)) {
          return false;
        }

        if (selectedRoles.length > 0 && !selectedRoles.some(role => job.title.includes(role))) {
          return false;
        }

        if (selectedLocation && job.location !== selectedLocation) {
          return false;
        }

        if (otherFilters.selectedWorkType && job.Work_Type !== otherFilters.selectedWorkType) {
          return false;
        }
        if (otherFilters.selectedContractType && job.Contract_Type !== otherFilters.selectedContractType) {
          return false;
        }
        if (otherFilters.selectedExperience && job.Experience_Level !== otherFilters.selectedExperience) {
          return false;
        }
        if (otherFilters.selectedWorkplace && job.Workplace_Model !== otherFilters.selectedWorkplace) {
          return false;
        }
      }
      return true;
    }).length
    : totalJobCount;

  return (
    <LinearGradient
      colors={['#90E0EF', '#CAF0F8', '#FFFFFF']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.8, y: 0.8 }}
      locations={[0, 0.4, 1]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Next IT Job</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search IT jobs..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={debouncedSetSearchQuery} // Use debounced setter
          />
          <TouchableOpacity onPress={openFilterScreen}>
            <Ionicons name="filter" size={20} color="#999" style={styles.filterIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {activeFilterTags.length > 0 && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersContent}
          >
            {activeFilterTags.map((tag, index) => (
              <View
                key={`${tag.type}-${tag.value}-${index}`}
                style={[
                  styles.activeFilterTag,
                  usingDefaultFilters && (tag.type === 'role' || tag.type === 'location') && styles.defaultFilterTag
                ]}
              >
                <Text style={styles.activeFilterText}>
                  {tag.label}
                  {/* Removed unnecessary conditional rendering of text here */}
                </Text>
                <TouchableOpacity
                  onPress={() => removeFilter(tag.type, tag.value)}
                  style={styles.removeFilterButton}
                >
                  <Ionicons name="close" size={14} color="#0096C7" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {(searchQuery || activeFilterTags.length > 0) && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsBackground}>
            <Text style={styles.resultsText}>
              {displayedJobCount} result{displayedJobCount !== 1 ? 's' : ''} found
            </Text>
          </View>
        </View>
      )}

      {renderContent()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    outlineWidth: 0,
    borderWidth: 0,
  },
  filterIcon: {
    marginLeft: 10,
  },
  activeFiltersContainer: {
    maxHeight: 80,
    marginBottom: 10,
  },
  activeFiltersContent: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#48CAE4',
  },
  activeFilterText: {
    fontSize: 12,
    color: '#0096C7',
    fontWeight: '500',
    marginRight: 6,
  },
  removeFilterButton: {
    padding: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  jobCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    padding: 20,
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
    backgroundColor: '#0096C7',
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
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  companyText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  jobType: {
    fontSize: 12,
    color: '#0096C7',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
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
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  detailsText: {
    fontSize: 12,
    color: '#999',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginTop: 12,
    textAlign: 'center',
  },
  noJobsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0096C7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skeletonContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skeletonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  skeletonCardContent: {
    padding: 20,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  skeletonAvatar: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    marginRight: 15,
  },
  skeletonJobInfo: {
    flex: 1,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
  },
  skeletonTags: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  skeletonTag: {
    height: 24,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    marginRight: 8,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
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
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  resultsBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  resultsText: {
    fontSize: 14,
    color: '#0096C7',
    fontWeight: '600',
  },
  loadMoreContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allLoadedContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allLoadedText: {
    color: '#666',
    fontSize: 14,
  },
  defaultFilterTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#90E0EF',
    borderWidth: 1,
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 100,
  },
  scrollToTopTouchable: {
    backgroundColor: '#0096C7',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default JobListings;