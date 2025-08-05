import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Import axios
import { useNavigation } from '@react-navigation/native';



const colors = {
    primary: '#48CAE4',
    secondary: '#0077B6',
    secondaryDark: '#023E8A',
    white: '#FFFFFF',
    lightGray: '#F8FAFC',
    gray: '#64748B',
    darkGray: '#334155',
    error: '#EF4444',
};

const BASE_URL = 'https://jobalign-backend.onrender.com/api';

const Quiz = ({topic,
    onBack = () => {},
    onComplete = () => {}, // This function will be called with score and response upon quiz completion
}) => {
    console.log('From Quiz page');
    console.log(topic);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [questions, setQuestions] = useState([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    // Placeholder values for roadMapId, skillId, topicId.
    // In a real application, these should be passed as props or fetched from a global state.
    const roadMapId = "6855c1f86b63cc4b3261b163";
    const skillId = "6855c2632292276a0c604559";
    const topicId = "6855c2632292276a0c60455a";

    const navigation = useNavigation();

    // Function to fetch quiz questions from the API using Axios
    const fetchQuizQuestions = async () => {
        // Ensure topic is valid before fetching
        if (!topic || !topic.topicName) {
            setFetchError("Topic information is missing. Cannot load quiz.");
            setIsLoadingQuestions(false);
            return;
        }

        try {
            setIsLoadingQuestions(true);
            setFetchError(null);

            const payload = {
                topic: topic.topicName,
                description: topic.description
            };

            // Use axios.post instead of fetch for the POST request
            const response = await axios.post(`${BASE_URL}/getTopicQuestions`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Axios automatically parses JSON, so data is directly available in response.data
            const data = response.data;

            const formattedQuestions = data.map(q => {
                const questionKey = Object.keys(q)[0];
                return {
                    id: questionKey,
                    text: q[questionKey]
                };
            });
            setQuestions(formattedQuestions);
        } catch (error) {
            console.error("Failed to fetch questions:", error);
            // Axios errors often have a response object with data and status
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred.";
            Alert.alert("Error", "Failed to load quiz questions: " + errorMessage);
            setFetchError("Failed to load quiz questions.");
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    // Effect hook to call fetchQuizQuestions when the component mounts
    useEffect(() => {
        fetchQuizQuestions();
    }, [topic]); // Rerun if topic changes

    const handleAnswerChange = (text) => {
        const currentQId = questions[currentQuestion]?.id;
        if (currentQId) {
            setAnswers(prev => ({
                ...prev,
                [currentQId]: text
            }));
        }
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert("Error", "User ID not found. Please log in again.");
                setIsSubmitting(false);
                return;
            }

            const answersObjectForAPI = questions.map(q => {
                const questionKey = q.id;
                const answerKey = `answer-${q.id.split('-')[1]}`;
                return {
                    [questionKey]: q.text,
                    [answerKey]: answers[q.id] || ""
                };
            });

            const payload = {
                userId: userId,
                roadMapId: roadMapId,
                skillId: skillId,
                topicId: topicId,
                answersObject: answersObjectForAPI,
            };

            console.log(payload)

            const response = await axios.post(`${BASE_URL}/checkTestAnswers`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = response.data; // Axios response data
            
            // Navigate to results page first
            console.log(result)
            navigation.navigate('QuizResults',result);
            

            // *** FIX: Call onComplete with the topic object and the score ***
            // This now matches what the Roadmap component expects.
            onComplete(topic, result.score);

        } catch (error) {
            console.error("Failed to submit quiz:", error);
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred.";
            Alert.alert("Error", "Failed to submit quiz: " + errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onMicrophonePress = () => {
        Alert.alert('Speech Recognition', 'Microphone button pressed - speech recognition would start here. (Not implemented in this example)');
    };

    const getCurrentAnswerText = () => {
        const currentQId = questions[currentQuestion]?.id;
        return currentQId ? (answers[currentQId] || '') : '';
    };

    if (isLoadingQuestions) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Loading quiz questions...</Text>
            </SafeAreaView>
        );
    }

    if (fetchError) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>{fetchError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchQuizQuestions}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (questions.length === 0) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={styles.loadingText}>No questions available for this topic.</Text>
                <TouchableOpacity style={styles.retryButton} onPress={onBack}>
                    <Text style={styles.retryButtonText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
            <View style={styles.quizHeader}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Icon name="close" size={24} color={colors.secondaryDark} />
                </TouchableOpacity>
                <Text style={styles.quizHeaderTitle}>Quiz</Text>
                <Text style={styles.quizProgress}>{currentQuestion + 1}/{questions.length}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.quizContainer}>
                <View style={styles.questionCard}>
                    <View style={styles.microphoneContainer}>
                        <TouchableOpacity
                            style={styles.microphoneButton}
                            onPress={onMicrophonePress}
                        >
                            <Icon
                                name="mic-none"
                                size={28}
                                color={colors.secondaryDark}
                            />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.questionNumber}>Question {currentQuestion + 1}</Text>
                    <Text style={styles.questionText}>{questions[currentQuestion]?.text}</Text>

                    <TextInput
                        style={styles.answerInput}
                        placeholder="Type your answer here..."
                        placeholderTextColor={colors.gray}
                        multiline
                        value={getCurrentAnswerText()}
                        onChangeText={handleAnswerChange}
                    />
                </View>

                <View style={styles.navigationContainer}>
                    <TouchableOpacity
                        style={[styles.navButton, currentQuestion === 0 && styles.disabledButton]}
                        onPress={handlePrevious}
                        disabled={currentQuestion === 0 || isSubmitting}
                    >
                        <Icon name="arrow-back" size={20} color={colors.white} />
                        <Text style={styles.navButtonText}>Previous</Text>
                    </TouchableOpacity>

                    {currentQuestion === questions.length - 1 ? (
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <>
                                    <Text style={styles.submitButtonText}>Submit Quiz</Text>
                                    <Icon name="check" size={20} color={colors.white} />
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={handleNext}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.navButtonText}>Next</Text>
                            <Icon name="arrow-forward" size={20} color={colors.white} />
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.lightGray,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.lightGray,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: colors.darkGray,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.lightGray,
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: colors.error,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: colors.secondary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    quizHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: colors.lightGray,
    },
    quizHeaderTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.secondaryDark,
    },
    quizProgress: {
        fontSize: 14,
        color: colors.gray,
        fontWeight: '500',
    },
    quizContainer: {
        padding: 16,
        flexGrow: 1,
    },
    questionCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    microphoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    microphoneButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionNumber: {
        fontSize: 14,
        color: colors.secondary,
        fontWeight: '600',
        marginBottom: 8,
    },
    questionText: {
        fontSize: 16,
        color: colors.darkGray,
        lineHeight: 24,
        marginBottom: 20,
    },
    answerInput: {
        borderWidth: 1,
        borderColor: colors.lightGray,
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        color: colors.darkGray,
        backgroundColor: colors.white,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 120,
        justifyContent: 'center',
    },
    navButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
        marginHorizontal: 8,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 140,
        justifyContent: 'center',
    },
    submitButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    disabledButton: {
        opacity: 0.6,
    },
});

export default Quiz;
