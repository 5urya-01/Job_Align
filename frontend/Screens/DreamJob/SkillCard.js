import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

const SkillCard = ({ skill, topics, onPress }) => {
    // Calculate completed topics and total topics for progress
    const completedTopics = topics.filter(topic => topic.completed).length;
    const totalTopics = topics.length;
    // Calculate progress percentage
    const progressPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    return (
        // TouchableOpacity to make the card clickable
        <TouchableOpacity style={styles.skillCard} onPress={() => onPress(skill.skillName, topics)}>
            <View style={styles.skillCardContent}>
                <View style={styles.skillHeader}>
                    {/* Icon for the skill */}
                    <View style={styles.skillIcon}>
                        <Icon name="menu-book" size={24} color={colors.secondary} />
                    </View>
                    <View style={styles.skillInfo}>
                        {/* Skill title, description, and number of topics */}
                        <Text style={styles.skillTitle}>{skill.skillName}</Text>
                        <Text style={styles.skillDescription}>{skill.description}</Text>
                        <Text style={styles.skillTopics}>{totalTopics} topics</Text>
                    </View>
                    {/* Chevron icon to indicate navigability */}
                    <Icon name="chevron-right" size={24} color={colors.primary} />
                </View>

                <View style={styles.skillProgress}>
                    <View style={styles.skillProgressHeader}>
                        <Text style={styles.progressText}>Progress</Text>
                        {/* Display completed topics out of total topics */}
                        <Text style={styles.progressCount}>{completedTopics}/{totalTopics}</Text>
                    </View>
                    <View style={styles.skillProgressBar}>
                        {/* Progress bar fill based on percentage */}
                        <View style={[styles.skillProgressFill, { width: `${progressPercentage}%` }]} />
                    </View>
                    {/* Display rounded progress percentage */}
                    <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    skillCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        marginBottom: 20,
        elevation: 4,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: colors.primaryLight,
    },
    skillCardContent: {
        padding: 24,
    },
    skillHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    skillIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    skillInfo: {
        flex: 1,
    },
    skillTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.darkGray,
        marginBottom: 4,
    },
    skillDescription: {
        fontSize: 14,
        color: colors.gray,
        marginBottom: 4,
    },
    skillTopics: {
        fontSize: 14,
        color: colors.gray,
    },
    skillProgress: {
        marginTop: 12,
    },
    skillProgressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    skillProgressBar: {
        height: 8,
        backgroundColor: colors.primaryPale,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
    },
    skillProgressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    progressPercentage: {
        fontSize: 14,
        color: colors.secondary,
        textAlign: 'right',
        fontWeight: '600',
    },
});

export default SkillCard;
