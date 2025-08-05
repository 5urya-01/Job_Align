import React, { useState, useMemo, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Get screen width for responsive design
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FilterScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get current filters and callback from route params
  const {
    currentFilters = {},
    onApplyFilters
  } = route.params || {};

  // Temporary filter states (used in this screen)
  const [tempSelectedLocations, setTempSelectedLocations] = useState(currentFilters.selectedLocations || []);
  const [tempSelectedRoles, setTempSelectedRoles] = useState(currentFilters.selectedRoles || []);
  const [tempSelectedCompanies, setTempSelectedCompanies] = useState(currentFilters.selectedCompanies || []);
  const [tempSelectedWorkTypes, setTempSelectedWorkTypes] = useState(currentFilters.selectedWorkTypes || []);
  const [tempSelectedContractTypes, setTempSelectedContractTypes] = useState(currentFilters.selectedContractTypes || []);
  const [tempSelectedExperiences, setTempSelectedExperiences] = useState(currentFilters.selectedExperiences || []);
  const [tempSelectedWorkplaces, setTempSelectedWorkplaces] = useState(currentFilters.selectedWorkplaces || []);

  const [activeFilterCategory, setActiveFilterCategory] = useState('companies');
  const [filterSearchQuery, setFilterSearchQuery] = useState('');

  // Static filter data - no API calls needed
  const filterData = {
    companies: [
      // Tech Giants
      "Amazon", "Google", "Microsoft", "Apple", "Meta (Facebook)", "Netflix", "Tesla", "Adobe", "Salesforce", "Oracle",
      
      // Indian IT Services
      "Infosys", "TCS (Tata Consultancy Services)", "Wipro", "HCL Technologies", "Tech Mahindra", "Cognizant", 
      "Mindtree", "L&T Infotech", "Mphasis", "Capgemini", "Accenture", "IBM", "DXC Technology",
      
      // Consulting & Professional Services
      "Deloitte", "PwC", "EY", "KPMG", "McKinsey & Company", "Boston Consulting Group", "Bain & Company",
      
      // Financial Services & Fintech
      "JPMorgan Chase", "Goldman Sachs", "Morgan Stanley", "Citibank", "Bank of America", "Wells Fargo",
      "PayPal", "Stripe", "Square", "Razorpay", "Paytm", "PhonePe", "Zerodha", "Groww",
      
      // E-commerce & Retail
      "Flipkart", "Myntra", "Snapdeal", "BigBasket", "Grofers (Blinkit)", "Swiggy", "Zomato", "Uber", "Ola",
      
      // Startups & Unicorns
      "Byju's", "Unacademy", "Vedantu", "WhiteHat Jr", "OYO", "Zomato", "PolicyBazaar", "Freshworks",
      "Zoho", "InMobi", "Ola Electric", "Dream11", "MPL", "Licious", "Urban Company", "Meesho",
      
      // Product Companies
      "Atlassian", "Slack", "Spotify", "Airbnb", "Uber", "LinkedIn", "Twitter", "Snapchat", "Pinterest",
      "Dropbox", "Zoom", "Shopify", "ServiceNow", "Workday", "Tableau", "Splunk", "MongoDB", "Redis",
      
      // Semiconductor & Hardware
      "Intel", "AMD", "NVIDIA", "Qualcomm", "Broadcom", "Texas Instruments", "Analog Devices", "Marvell",
      
      // Telecommunications
      "Jio", "Airtel", "Vi (Vodafone Idea)", "BSNL", "Ericsson", "Nokia", "Cisco", "Juniper Networks",
      
      // Media & Entertainment
      "Disney", "Warner Bros", "Sony", "Viacom", "Times Internet", "Network18", "Zee Entertainment",
      
      // Healthcare & Biotech
      "Pfizer", "Johnson & Johnson", "Roche", "Novartis", "Abbott", "Medtronic", "Siemens Healthineers",
      
      // Automotive
      "Tata Motors", "Mahindra", "Maruti Suzuki", "Hyundai", "Honda", "Toyota", "Ford", "BMW", "Mercedes-Benz"
    ],
    roles: [
      // Software Development
      "Software Engineer", "Senior Software Engineer", "Lead Software Engineer", "Principal Software Engineer",
      "Frontend Developer", "Backend Developer", "Full Stack Developer", "Web Developer", "Mobile Developer",
      "React Developer", "Angular Developer", "Vue.js Developer", "Node.js Developer", "Python Developer",
      "Java Developer", "C++ Developer", "C# Developer", ".NET Developer", "PHP Developer", "Ruby Developer",
      "Go Developer", "Rust Developer", "Kotlin Developer", "Swift Developer", "Flutter Developer",
      "React Native Developer", "iOS Developer", "Android Developer", "Xamarin Developer",
      
      // Data & Analytics
      "Data Scientist", "Senior Data Scientist", "Data Analyst", "Business Analyst", "Data Engineer",
      "Machine Learning Engineer", "AI Engineer", "Deep Learning Engineer", "MLOps Engineer",
      "Business Intelligence Developer", "Data Architect", "Analytics Manager", "Quantitative Analyst",
      
      // DevOps & Cloud
      "DevOps Engineer", "Site Reliability Engineer (SRE)", "Cloud Engineer", "Cloud Architect",
      "AWS Developer", "Azure Developer", "GCP Developer", "Kubernetes Engineer", "Docker Specialist",
      "Infrastructure Engineer", "Platform Engineer", "Release Engineer", "Build Engineer",
      
      // Cybersecurity
      "Security Engineer", "Cybersecurity Analyst", "Information Security Specialist", "Penetration Tester",
      "Security Architect", "SOC Analyst", "Incident Response Specialist", "Compliance Officer",
      
      // Quality Assurance
      "QA Engineer", "Test Engineer", "SDET (Software Development Engineer in Test)", "Automation Tester",
      "Manual Tester", "Performance Tester", "Security Tester", "Mobile Tester", "Game Tester",
      
      // UI/UX Design
      "UI Designer", "UX Designer", "UI/UX Designer", "Product Designer", "Visual Designer",
      "Interaction Designer", "User Researcher", "Design Researcher", "Graphic Designer", "Web Designer",
      
      // Product Management
      "Product Manager", "Senior Product Manager", "Associate Product Manager", "Technical Product Manager",
      "Product Owner", "Product Marketing Manager", "Growth Product Manager", "Platform Product Manager",
      
      // Project Management
      "Project Manager", "Program Manager", "Scrum Master", "Agile Coach", "Delivery Manager",
      "Technical Program Manager", "PMO Lead", "Portfolio Manager",
      
      // Sales & Marketing
      "Sales Executive", "Business Development Manager", "Account Manager", "Sales Manager",
      "Digital Marketing Manager", "Content Marketing Manager", "SEO Specialist", "SEM Specialist",
      "Social Media Manager", "Brand Manager", "Marketing Analyst", "Growth Hacker",
      
      // Operations & Support
      "Technical Support Engineer", "Customer Success Manager", "Operations Manager", "System Administrator",
      "Database Administrator", "Network Administrator", "IT Support Specialist", "Help Desk Technician",
      
      // Finance & Accounting
      "Financial Analyst", "Accountant", "Finance Manager", "Investment Analyst", "Risk Analyst",
      "Treasury Analyst", "Tax Consultant", "Audit Associate", "Controller", "CFO",
      
      // Human Resources
      "HR Generalist", "HR Business Partner", "Talent Acquisition Specialist", "Recruiter",
      "Training Manager", "Compensation Analyst", "Employee Relations Manager", "HRIS Analyst",
      
      // Research & Development
      "Research Scientist", "R&D Engineer", "Innovation Manager", "Technology Researcher",
      "Algorithm Developer", "Computer Vision Engineer", "NLP Engineer", "Robotics Engineer",
      
      // Management & Leadership
      "Team Lead", "Engineering Manager", "Director of Engineering", "VP of Engineering", "CTO",
      "Technical Lead", "Architect", "Solutions Architect", "Enterprise Architect", "Chief Architect",
      
      // Specialized Roles
      "Blockchain Developer", "Game Developer", "AR/VR Developer", "IoT Developer", "Embedded Systems Engineer",
      "Firmware Engineer", "Hardware Engineer", "ASIC Design Engineer", "FPGA Engineer",
      "Network Engineer", "Systems Engineer", "Integration Engineer", "Performance Engineer",
      
      // Consulting
      "Technical Consultant", "Solution Consultant", "Implementation Consultant", "Pre-sales Engineer",
      "Customer Engineer", "Field Engineer", "Professional Services Consultant",
      
      // Content & Communication
      "Technical Writer", "Content Creator", "Documentation Specialist", "Communications Manager",
      "Developer Advocate", "Community Manager", "Training Specialist"
    ],
    locations: [
      // Metro Cities
      "Bangalore", "Hyderabad", "Chennai", "Mumbai", "Pune", "Delhi", "Gurgaon", "Noida", "Kolkata",
      
      // Tier 2 Cities
      "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", // Gujarat
      "Jaipur", "Jodhpur", "Udaipur", // Rajasthan
      "Lucknow", "Kanpur", "Agra", "Varanasi", // Uttar Pradesh
      "Patna", "Gaya", // Bihar
      "Bhubaneswar", "Cuttack", // Odisha
      "Chandigarh", "Ludhiana", "Amritsar", // Punjab
      "Dehradun", "Haridwar", // Uttarakhand
      "Indore", "Bhopal", "Gwalior", // Madhya Pradesh
      "Nagpur", "Nashik", "Aurangabad", // Maharashtra
      "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", // Tamil Nadu
      "Kochi", "Thiruvananthapuram", "Kozhikode", // Kerala
      "Visakhapatnam", "Vijayawada", "Guntur", // Andhra Pradesh
      "Mysore", "Mangalore", "Hubli", // Karnataka
      "Guwahati", "Dibrugarh", // Assam
      "Bhopal", "Jabalpur", // Madhya Pradesh
      "Raipur", "Bilaspur", // Chhattisgarh
      "Ranchi", "Jamshedpur", // Jharkhand
      
      // International Locations
      "Singapore", "Dubai", "London", "New York", "San Francisco", "Toronto", "Sydney", "Tokyo", "Berlin"
    ],
    workTypes: ['Full-Time', 'Part-Time', 'Internship', 'Freelance', 'Contract', 'Temporary', 'Consultant'],
    contractTypes: ['Permanent', 'Contract', 'Temporary', 'Fixed-Term', 'Project-Based', 'Seasonal'],
    experienceLevels: ['Fresher', 'Experienced'],
    workplaceModels: ['On-site', 'Remote', 'Hybrid', 'Work from Home', 'Flexible']
  };

  // Filter categories configuration
  const filterCategories = [
    { id: 'companies', label: 'Companies', searchable: true, apiField: 'companies' },
    { id: 'roles', label: 'Roles', searchable: true, apiField: 'roles' },
    { id: 'locations', label: 'Locations', searchable: true, apiField: 'locations' },
    { id: 'workTypes', label: 'Work Types', searchable: false, apiField: 'workTypes' },
    { id: 'contractTypes', label: 'Contract Types', searchable: false, apiField: 'contractTypes' },
    { id: 'experienceLevels', label: 'Experience', searchable: false, apiField: 'experienceLevels' },
    { id: 'workplaceModels', label: 'Workplace', searchable: false, apiField: 'workplaceModels' }
  ];

  // Apply filters when user clicks Apply
  const applyFilters = useCallback(() => {
    const newFilters = {
      selectedLocations: [...tempSelectedLocations],
      selectedRoles: [...tempSelectedRoles],
      selectedCompanies: [...tempSelectedCompanies],
      selectedWorkTypes: [...tempSelectedWorkTypes],
      selectedContractTypes: [...tempSelectedContractTypes],
      selectedExperiences: [...tempSelectedExperiences],
      selectedWorkplaces: [...tempSelectedWorkplaces],
    };
    
    if (onApplyFilters) {
      onApplyFilters(newFilters);
    }
    navigation.goBack();
  }, [
    tempSelectedLocations, 
    tempSelectedRoles,
    tempSelectedCompanies, 
    tempSelectedWorkTypes,
    tempSelectedContractTypes,
    tempSelectedExperiences,
    tempSelectedWorkplaces,
    onApplyFilters,
    navigation
  ]);

  // Close filter screen
  const closeFilterScreen = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Get selection state based on category
  const getSelectionState = useCallback((category) => {
    switch (category) {
      case 'companies':
        return tempSelectedCompanies;
      case 'roles':
        return tempSelectedRoles;
      case 'locations':
        return tempSelectedLocations;
      case 'workTypes':
        return tempSelectedWorkTypes;
      case 'contractTypes':
        return tempSelectedContractTypes;
      case 'experienceLevels':
        return tempSelectedExperiences;
      case 'workplaceModels':
        return tempSelectedWorkplaces;
      default:
        return [];
    }
  }, [
    tempSelectedCompanies, 
    tempSelectedRoles,
    tempSelectedLocations, 
    tempSelectedWorkTypes,
    tempSelectedContractTypes,
    tempSelectedExperiences,
    tempSelectedWorkplaces
  ]);

  // Toggle selection for different categories
  const toggleTempSelection = useCallback((category, item) => {
    switch (category) {
      case 'companies':
        setTempSelectedCompanies(prev =>
          prev.includes(item)
            ? prev.filter(c => c !== item)
            : [...prev, item]
        );
        break;
      case 'roles':
        setTempSelectedRoles(prev =>
          prev.includes(item)
            ? prev.filter(r => r !== item)
            : [...prev, item]
        );
        break;
      case 'locations':
        setTempSelectedLocations(prev =>
          prev.includes(item)
            ? prev.filter(l => l !== item)
            : [...prev, item]
        );
        break;
      case 'workTypes':
        setTempSelectedWorkTypes(prev =>
          prev.includes(item)
            ? prev.filter(w => w !== item)
            : [...prev, item]
        );
        break;
      case 'contractTypes':
        setTempSelectedContractTypes(prev =>
          prev.includes(item)
            ? prev.filter(c => c !== item)
            : [...prev, item]
        );
        break;
      case 'experienceLevels':
        setTempSelectedExperiences(prev =>
          prev.includes(item)
            ? prev.filter(e => e !== item)
            : [...prev, item]
        );
        break;
      case 'workplaceModels':
        setTempSelectedWorkplaces(prev =>
          prev.includes(item)
            ? prev.filter(w => w !== item)
            : [...prev, item]
        );
        break;
    }
  }, []);

  // Check if item is selected
  const isTempSelected = useCallback((category, item) => {
    const selectionState = getSelectionState(category);
    return selectionState.includes(item);
  }, [getSelectionState]);

  // Clear all temporary filters
  const clearAllTempFilters = useCallback(() => {
    setTempSelectedCompanies([]);
    setTempSelectedRoles([]);
    setTempSelectedLocations([]);
    setTempSelectedWorkTypes([]);
    setTempSelectedContractTypes([]);
    setTempSelectedExperiences([]);
    setTempSelectedWorkplaces([]);
  }, []);

  // Get filtered items for current category
  const getCurrentCategoryItems = useMemo(() => {
    const category = filterCategories.find(c => c.id === activeFilterCategory);
    if (!category) return [];

    const items = filterData[category.apiField] || [];

    if (category.searchable && filterSearchQuery) {
      return items.filter(item =>
        item.toLowerCase().includes(filterSearchQuery.toLowerCase())
      );
    }

    return items;
  }, [activeFilterCategory, filterSearchQuery, filterData]);

  // Handle filter category selection
  const handleFilterCategorySelect = useCallback((categoryId) => {
    setActiveFilterCategory(categoryId);
    setFilterSearchQuery('');
  }, []);

  // Get total selected filters count
  const getTotalSelectedCount = useMemo(() => {
    return (
      tempSelectedCompanies.length +
      tempSelectedRoles.length +
      tempSelectedLocations.length +
      tempSelectedWorkTypes.length +
      tempSelectedContractTypes.length +
      tempSelectedExperiences.length +
      tempSelectedWorkplaces.length
    );
  }, [
    tempSelectedCompanies,
    tempSelectedRoles,
    tempSelectedLocations,
    tempSelectedWorkTypes,
    tempSelectedContractTypes,
    tempSelectedExperiences,
    tempSelectedWorkplaces
  ]);

  // Get selected count for specific category
  const getCategorySelectedCount = useCallback((categoryId) => {
    const selectionState = getSelectionState(categoryId);
    return selectionState.length;
  }, [getSelectionState]);

  return (
    <LinearGradient
      colors={['#90E0EF', '#CAF0F8', '#FFFFFF']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.8, y: 0.8 }}
      locations={[0, 0.4, 1]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={closeFilterScreen}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#0096C7" />
        </TouchableOpacity>
        <Text style={styles.title}>Filter Jobs</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearAllTempFilters}
          activeOpacity={0.8}
        >
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {/* Sidebar with filter categories */}
        <ScrollView
          style={styles.sidebar}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {filterCategories.map((category) => {
            const selectedCount = getCategorySelectedCount(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  activeFilterCategory === category.id && styles.highlightedCategory
                ]}
                onPress={() => handleFilterCategorySelect(category.id)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryContent}>
                  <Text style={[
                    styles.categoryText,
                    activeFilterCategory === category.id && styles.highlightedCategoryText
                  ]}>
                    {category.label}
                  </Text>
                  {selectedCount > 0 && (
                    <View style={styles.selectedCountBadge}>
                      <Text style={styles.selectedCountText}>{selectedCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Options area */}
        <View style={styles.optionsArea}>
          {/* Search input for searchable categories */}
          {filterCategories.find(c => c.id === activeFilterCategory)?.searchable && (
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={16} color="#999" style={styles.searchIcon} />
                <TextInput
                  placeholder={`Search ${filterCategories.find(c => c.id === activeFilterCategory)?.label.toLowerCase()}...`}
                  value={filterSearchQuery}
                  onChangeText={setFilterSearchQuery}
                  style={styles.searchInput}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          )}

          {/* Filter options list */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.optionsScrollContent}
          >
            {getCurrentCategoryItems.length > 0 ? (
              getCurrentCategoryItems.map((item, index) => (
                <TouchableOpacity
                  key={`${activeFilterCategory}-${item}-${index}`}
                  style={styles.filterOption}
                  onPress={() => toggleTempSelection(activeFilterCategory, item)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.checkbox,
                    isTempSelected(activeFilterCategory, item) && styles.checkedBox
                  ]}>
                    {isTempSelected(activeFilterCategory, item) && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.optionText} numberOfLines={2}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={32} color="#48CAE4" />
                <Text style={styles.emptyStateText}>
                  {filterSearchQuery ? 'No results found' : 'No options available'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Footer with apply button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={applyFilters}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#0096C7', '#48CAE4']}
            style={styles.applyButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.applyButtonText}>
              Apply Filters {getTotalSelectedCount > 0 && `(${getTotalSelectedCount})`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#48CAE4',
  },
  clearText: {
    fontSize: 14,
    color: '#0096C7',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 1,
  },
  sidebar: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    maxWidth: SCREEN_WIDTH * 0.35,
  },
  categoryItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(72, 202, 228, 0.2)',
  },
  highlightedCategory: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRightWidth: 3,
    borderRightColor: '#0096C7',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  highlightedCategoryText: {
    color: '#0096C7',
    fontWeight: '600',
  },
  selectedCountBadge: {
    backgroundColor: '#0096C7',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    minWidth: 18,
    alignItems: 'center',
  },
  selectedCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  optionsArea: {
    flex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    outlineWidth: 0,
    borderWidth: 0,
  },
  optionsScrollContent: {
    paddingBottom: 20,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(72, 202, 228, 0.1)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#48CAE4',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#0096C7',
    borderColor: '#0096C7',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    fontWeight: '500',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(72, 202, 228, 0.2)',
  },
  applyButton: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  applyButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});