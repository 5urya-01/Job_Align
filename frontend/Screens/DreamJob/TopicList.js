import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Color palette - Re-define or import from a central style file if available
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

const TopicList = ({ skill, topics, onBack, onStartQuiz }) => {

    return (
        <SafeAreaView style={styles.container}>
            {/* Set status bar style */}
            <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
            <View style={styles.topicListHeader}>
                {/* Back button */}
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={colors.secondaryDark} />
                </TouchableOpacity>
                {/* *** FIX: Access the skillName property of the skill object for the title *** */}
                <Text style={styles.topicListHeaderTitle}>{skill?.skillName || 'Topics'}</Text>
            </View>

            {/* Scrollable list of topics */}
            <ScrollView style={styles.topicList}>
                {topics.map((topic, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.topicItem}
                        onPress={() => onStartQuiz(topic)} // Call onStartQuiz when a topic is pressed
                    >
                        <View style={styles.topicItemContent}>
                            {/* Topic icon, changes based on completion status */}
                            <View style={[styles.topicItemIcon, topic.completed && styles.topicItemIconCompleted]}>
                                <Icon
                                    name={topic.completed ? "check" : "play-arrow"} // 'check' if completed, 'play-arrow' otherwise
                                    size={20}
                                    color={topic.completed ? colors.white : colors.secondary}
                                />
                            </View>
                            <View style={styles.topicItemInfo}>
                                {/* Topic title and description */}
                                <Text style={styles.topicItemTitle}>{topic.topicName}</Text>
                                <Text style={styles.topicItemDescription}>{topic.description}</Text>
                                {/* Display score if topic is completed and has a score */}
                                {topic.completed && topic.score != null && (
                                    <Text style={styles.topicItemScore}>Score: {topic.score}%</Text>
                                )}
                            </View>
                            {/* Chevron icon to indicate navigability */}
                            <Icon name="chevron-right" size={20} color={colors.primary} />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.lightGray, // Assuming a background for the list
    },
    topicListHeader: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        elevation: 4,
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    topicListHeaderTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.secondaryDark,
        marginLeft: 16,
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
    },
    topicList: {
        flex: 1,
        padding: 24,
    },
    topicItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: colors.primaryLight,
    },
    topicItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    topicItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    topicItemIconCompleted: {
        backgroundColor: colors.success,
    },
    topicItemInfo: {
        flex: 1,
    },
    topicItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.darkGray,
        marginBottom: 4,
    },
    topicItemDescription: {
        fontSize: 14,
        color: colors.gray,
        lineHeight: 20,
    },
    topicItemScore: {
        fontSize: 14,
        color: colors.secondary,
        fontWeight: '600',
        marginTop: 4,
    },
});

export default TopicList;
