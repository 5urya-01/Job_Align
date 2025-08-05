import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const sliderRef = useRef(null);
  const navigation = useNavigation();
  const [activeSlide, setActiveSlide] = useState(0);

  // Exact data from TSX version
  const analyticsData = {
    totalApplications: 1,
    interviewsScheduled: 0,
    responseRate: 0,
    averageMatchScore: 75,
    weeklyProgress: [
      { day: "Mon", applications: 3 },
      { day: "Tue", applications: 5 },
      { day: "Wed", applications: 2 },
      { day: "Thu", applications: 4 },
      { day: "Fri", applications: 6 },
      { day: "Sat", applications: 2 },
      { day: "Sun", applications: 2 }
    ],
    recentAchievements: [
      "Recent Achievements - 1",
      "Recent Achievements - 2",
      "Recent Achievements - 3"
    ]
  };

  // Quick Actions data for slider with updated navigation
  const quickActions = [
    {
      id: 1,
      icon: 'robot-outline', // Changed from 'magnify'
      title: 'Chat Bot',      // Changed from 'Find Jobs'
      subtitle: 'Ask me anything', // Changed subtitle
      color: '#0077B6',
      target: 'Chatbot'       // Navigation route
    },
    {
      id: 2,
      icon: 'head-question-outline',
      title: 'Take Quiz',
      subtitle: 'Test your skills',
      color: '#FF7D00',
      target: 'Quiz'           // Navigation route
    },
    {
      id: 3,
      icon: 'chart-line',
      title: 'ATs Score',
      subtitle: 'View your scores',
      color: '#00B4A0',
      target: 'ATS'           // Navigation route
    },
    {
      id: 4,
      icon: 'road-variant',
      title: 'Roadmap',
      subtitle: 'Career journey',
      color: '#6A4C93',
      target: 'Roadmap'       // Navigation route
    }
  ];

  const maxApplications = Math.max(...analyticsData.weeklyProgress.map(d => d.applications));

  const renderQuickAction = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.sliderActionButton,
        index === activeSlide && styles.activeSlide
      ]}
      activeOpacity={0.8}
      onPress={() => {
        // Updated navigation logic
        if (item.target) {
          navigation.navigate(item.target);
        }
      }}
    >
      <View style={[styles.sliderActionCard, { backgroundColor: item.color }]}>
        <View style={styles.sliderIconContainer}>
          <Icon name={item.icon} size={28} color="#FFFFFF" />
        </View>
        <View style={styles.sliderTextContainer}>
          <Text style={styles.sliderActionTitle}>{item.title}</Text>
          <Text style={styles.sliderActionSubtitle}>{item.subtitle}</Text>
        </View>
        <View style={styles.sliderArrow}>
          <Icon name="chevron-right" size={20} color="#FFFFFF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveSlide(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  return (
    <View style={styles.container}>
      {/* Main Background Gradient */}
      <LinearGradient
        colors={['#CAF0F8', '#FAFCFF', '#FFFFFF']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appTitle}>Job Align</Text>
            <Text style={styles.welcomeTitle}>Welcome back, Surya!</Text>
            <Text style={styles.subtitle}>Here's your career progress overview</Text>
          </View>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            {/* Total Applications */}
            <View style={[styles.statCard, { backgroundColor: '#FAFCFF' }]}>
              <Text style={styles.statNumber}>{analyticsData.totalApplications}</Text>
              <Text style={styles.statLabel}>Total Applications</Text>
            </View>

            {/* Interviews */}
            <View style={[styles.statCard, { backgroundColor: '#CAF0F8' }]}>
              <Text style={styles.statNumberDark}>{analyticsData.interviewsScheduled}</Text>
              <Text style={styles.statLabelDark}>Interviews</Text>
            </View>

            {/* Response Rate */}
            <View style={[styles.statCard, { backgroundColor: '#ADE8F4' }]}>
              <Text style={styles.statNumberDark}>{analyticsData.responseRate}%</Text>
              <Text style={styles.statLabelDark}>Response Rate</Text>
            </View>

            {/* Average Match Score */}
            <View style={[styles.statCard, { backgroundColor: '#90E0EF' }]}>
              <Text style={styles.statNumberDark}>{analyticsData.averageMatchScore}%</Text>
              <Text style={styles.statLabelDark}>Avg ATS Score</Text>
            </View>
          </View>

          {/* Weekly Progress Chart */}
          <View style={[styles.chartCard, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.chartHeader}>
              <Icon name="trending-up" size={20} color="#0077B6" />
              <Text style={styles.chartTitle}>This Week's Activity</Text>
            </View>
            <View style={styles.chart}>
              {analyticsData.weeklyProgress.map((day, index) => (
                <View key={index} style={styles.chartItem}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.squareBar,
                        {
                          height: Math.max((day.applications / maxApplications) * 60, 12),
                          backgroundColor: '#0077B6'
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.dayLabel}>{day.day}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.chartSubtitle}>Applications per day</Text>
          </View>

          {/* Recent Achievements */}
          <View style={[styles.achievementsCard, { backgroundColor: '#FAFCFF' }]}>
            <View style={styles.achievementsHeader}>
              <Icon name="trophy-outline" size={20} color="#0077B6" />
              <Text style={styles.achievementsTitle}>Recent Achievements</Text>
            </View>
            <View style={styles.achievementsList}>
              {analyticsData.recentAchievements.map((achievement, index) => (
                <View key={index} style={styles.achievementItem}>
                  <View style={styles.achievementDot} />
                  <Text style={styles.achievementText}>{achievement}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions Slider */}
          <View style={[styles.actionsCard, { backgroundColor: '#FFFFFF' }]}>
            <Text style={styles.actionsTitle}>Quick Actions</Text>
            <FlatList
              ref={sliderRef}
              data={quickActions}
              renderItem={renderQuickAction}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToInterval={width - 60}
              decelerationRate="fast"
              contentContainerStyle={styles.sliderContainer}
              ItemSeparatorComponent={() => <View style={styles.sliderSeparator} />}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
            />

            {/* Custom Dots Indicator */}
            <View style={styles.dotsContainer}>
              {quickActions.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    sliderRef.current?.scrollToIndex({ index, animated: true });
                  }}
                >
                  <View
                    style={[
                      styles.dot,
                      index === activeSlide && styles.activeDot
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 32,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0077B6',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Stats Grid
  statsGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (width - 56) / 2,
    height: 110,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0077B6',
    marginBottom: 6,
  },
  statNumberDark: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#030E5E',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  statLabelDark: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Chart Card
  chartCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 10,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 90,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  chartItem: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 70,
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  squareBar: {
    width: 28,
    borderRadius: 4,
    minHeight: 12,
    shadowColor: '#0077B6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  dayLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  chartSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },

  // Achievements Card
  achievementsCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 10,
  },
  achievementsList: {
    marginTop: 8,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  achievementDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0096C7',
    marginRight: 12,
    shadowColor: '#0096C7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },

  // Slider Actions Card
  actionsCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  actionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },

  // Slider Styles
  sliderContainer: {
    paddingLeft: 0,
  },
  sliderSeparator: {
    width: 16,
  },
  sliderActionButton: {
    width: width - 80,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    transform: [{ scale: 0.95 }],
  },
  sliderActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 100,
    justifyContent: 'space-between',
    borderRadius: 20,
  },
  activeSlide: {
    transform: [{ scale: 1 }],
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sliderIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sliderTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  sliderActionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sliderActionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  sliderArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Dots Indicator
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  activeDot: {
    width: 12,
    backgroundColor: '#0077B6',
    opacity: 1,
  },
});

export default HomeScreen;