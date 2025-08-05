import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    RefreshControl,
    ActivityIndicator, // Ensure ActivityIndicator is imported
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Import the new components
import SkillCard from './SkillCard';
import TopicList from './TopicList';
import Quiz from './Quiz';

const { width } = Dimensions.get('window');

// Color palette
const colors = {
    primary: '#48CAE4',
    primaryMid: '#90E0EF',
    primaryLight: '#ADE8F4',
    primaryPale: '#CAF0F8',
    secondary: '#0077B6',
    secondaryDark: '#023E8A',
    accent: '#00B4D8',
    primaryDark: '#03045E',
    tertiary: '#0096C7',
    white: '#FFFFFF',
    lightGray: '#F8FAFC',
    gray: '#64748B',
    darkGray: '#334155',
    progressBg: '#E2E8F0',
    success: '#06B6D4',
    warning: '#F59E0B',
    error: '#EF4444',
};

// Header Component (remains in Roadmap.js as it uses overall roadmap data)
const Header = ({ totalTopics, completedTopics, dreamRole }) => {
    const progressPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    return (
        <View style={styles.header}>
            <View style={styles.headerContent}>
                <View style={styles.pathIndicator}>
                    <View style={styles.pathDot} />
                    <Text style={styles.pathText}>{dreamRole || 'Developer'} Path</Text>
                </View>

                <Text style={styles.mainTitle}>Master Your Skills</Text>
                <Text style={styles.subtitle}>Build expertise one topic at a time</Text>

                <LinearGradient // Linear Gradient for the progress card
                    colors={['#FFFFFF', '#F8FAFC']} // White to light gray for a subtle effect
                    style={styles.progressCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.progressHeader}>
                        <View style={styles.progressInfo}>
                            <View style={styles.progressIcon}>
                                <Icon name="trending-up" size={24} color={colors.white} />
                            </View>
                            <View style={styles.progressText}>
                                <Text style={styles.progressTitle}>Overall Progress</Text>
                                <Text style={styles.progressSubtitle}>
                                    {completedTopics} of {totalTopics} topics completed
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                        </View>
                        <View style={styles.progressLabels}>
                            <Text style={styles.progressLabel}>0%</Text>
                            <Text style={[styles.progressLabel, styles.progressLabelCurrent]}>{Math.round(progressPercentage)}%</Text>
                            <Text style={styles.progressLabel}>100%</Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
};


// Main App Component
const Roadmap = () => {
    const [currentView, setCurrentView] = useState('main');
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [roadmapData, setRoadmapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Function to fetch roadmap data
    const fetchRoadmap = useCallback(async () => {
        setRefreshing(true);
        setError(null);
        try {
            const userId = await AsyncStorage.getItem('userId');

            if (userId) {
                const response = await axios.post('https://jobalign-backend.onrender.com/api/getRoadMap', {
                    userId: userId
                });
                setRoadmapData(response.data[0]);
            } else {
                setError("Could not find user credentials.");
                console.log("UserID not found in AsyncStorage. Please ensure it is set.");
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching roadmap:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchRoadmap();
    }, [fetchRoadmap]);

    const onRefresh = useCallback(() => {
        fetchRoadmap();
    }, [fetchRoadmap]);

    const totalTopics = roadmapData ? roadmapData.skills.reduce((sum, skill) => sum + skill.topics.length, 0) : 0;
    const completedTopics = roadmapData ? roadmapData.skills.reduce((sum, skill) =>
        sum + skill.topics.filter(topic => topic.completed).length, 0
    ) : 0;

    const handleSkillPress = (skill, topics) => {
        setSelectedSkill(skill);
        setSelectedTopics(topics);
        setCurrentView('topic');
    };

    const handleStartQuiz = (topic) => {
        setSelectedTopic(topic);
        setCurrentView('quiz');
    };

    const handleQuizComplete = (topic, score) => {
        const updatedSkills = roadmapData.skills.map(skill => ({
            ...skill,
            topics: skill.topics.map(t =>
                t.topicName === topic.topicName
                    ? { ...t, completed: true, score: score }
                    : t
            )
        }));

        setRoadmapData({ ...roadmapData, skills: updatedSkills });
        setCurrentView('topic');
    };

    const handleBack = () => {
        if (currentView === 'topic') {
            setCurrentView('main');
        }
    };

    // Conditional rendering for loading state
    if (loading) {
        return (
            <LinearGradient
                colors={['#90E0EF', '#CAF0F8', '#FFFFFF']}
                style={styles.loadingContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.8, y: 0.8 }}
                locations={[0, 0.4, 1]}
            >
                <SafeAreaView style={styles.loadingContent}>
                    <ActivityIndicator size="large" color={colors.primaryDark} />
                    <Text style={styles.loadingText}>Loading Roadmap...</Text>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    if (error) {
        return (
            <LinearGradient
                colors={['#90E0EF', '#CAF0F8', '#FFFFFF']}
                style={styles.loadingContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.8, y: 0.8 }}
                locations={[0, 0.4, 1]}
            >
                <SafeAreaView style={styles.loadingContent}>
                    <Text style={styles.errorText}>Error loading roadmap: {error}</Text>
                    <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Tap to Retry</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    if (!roadmapData) {
        return (
            <LinearGradient
                colors={['#90E0EF', '#CAF0F8', '#FFFFFF']}
                style={styles.loadingContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.8, y: 0.8 }}
                locations={[0, 0.4, 1]}
            >
                <SafeAreaView style={styles.loadingContent}>
                    <Text style={styles.errorText}>No roadmap data available</Text>
                    <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Tap to Retry</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    if (currentView === 'quiz' && selectedTopic) {
        return (
            <Quiz
                topic={selectedTopic}
                onBack={() => setCurrentView('topic')}
                onComplete={handleQuizComplete}
            />
        );
    }

    if (currentView === 'topic') {
        return (
            <TopicList
                skill={selectedSkill}
                topics={selectedTopics}
                onBack={handleBack}
                onStartQuiz={handleStartQuiz}
            />
        );
    }

    return (
        <LinearGradient // Main Linear Gradient background
            colors={['#90E0EF', '#CAF0F8', '#FFFFFF']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 0.8 }}
            locations={[0, 0.4, 1]}
        >
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={'rgba(72, 202, 228, 0.9)'} />
                <ScrollView
                    contentContainerStyle={styles.scrollViewContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primaryDark}
                            colors={[colors.primary]}
                        />
                    }
                >
                    <Header
                        totalTopics={totalTopics}
                        completedTopics={completedTopics}
                        dreamRole={roadmapData.dreamRole}
                    />

                    <View style={styles.skillsList}>
                        {roadmapData.skills.map((skillData, index) => (
                            <SkillCard
                                key={index}
                                skill={skillData}
                                topics={skillData.topics}
                                onPress={handleSkillPress}
                            />
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
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
    loadingContent: {
        justifyContent: 'center',
        alignItems: 'center',
        // Add padding or margin if needed
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: colors.primaryDark,
    },
    errorText: {
        fontSize: 18,
        color: colors.error,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    retryButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    header: {
        paddingBottom: 32,
    },
    headerContent: {
        padding: 24,
    },
    pathIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    pathDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.primaryLight,
        marginRight: 12,
    },
    pathText: {
        color: colors.secondaryDark,
        fontSize: 14,
        fontWeight: '600',
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.secondaryDark,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 18,
        color: colors.secondaryDark,
        marginBottom: 32,
        opacity: 0.8,
    },
    progressCard: {
        borderRadius: 20,
        padding: 24,
        elevation: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    progressInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    progressIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    progressText: {
        flex: 1,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.darkGray,
        marginBottom: 4,
    },
    progressSubtitle: {
        fontSize: 14,
        color: colors.gray,
    },
    progressBarContainer: {
        marginTop: 12,
    },
    progressBar: {
        height: 10,
        backgroundColor: colors.primaryPale,
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 5,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    progressLabel: {
        fontSize: 14,
        color: colors.gray,
    },
    progressLabelCurrent: {
        color: colors.secondary,
        fontWeight: '600',
    },
    skillsList: {
        padding: 24,
    },
});

export default Roadmap;
