import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  StatusBar,
  Dimensions
} from 'react-native';
import ChatMessage from './chatmessage';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { getBotResponse } from './chatbotAPI';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const ChatScreen = () => {
  const [messages, setMessages] = useState([
    {
      text: "👋🏻 Hi, I'm Job Align – your smart career assistant! I'm here to help you discover your dream job, explore trending roles, and guide you with customized skill roadmaps.\n\nJust tell me what job you're aiming for, and I'll provide the skills you need and how to master them. Let's make your career journey smooth and successful!",
      sender: 'bot',
      id: '1'
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef();
  const insets = useSafeAreaInsets();

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: 'user', id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getBotResponse(input);
      const botMsg = {
        text: response.bot,
        sender: 'bot',
        id: (Date.now() + 1).toString()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setMessages(prev => [...prev, {
        text: "Oops! Something went wrong with Gemini API. Please try again.",
        sender: 'bot',
        id: (Date.now() + 2).toString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Clean typing indicator
  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>AI is typing...</Text>
        </View>
      </View>
    );
  };

  return (
    <>
      {/* Status Bar matching header */}
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0077B6" 
        translucent={false}
      />
      
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            {/* Header without back button */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
              <View style={styles.botImageContainer}>
                <Image
                  source={require('../../assets/images/bot.jpg')}
                  style={styles.botImage}
                />
                <View style={styles.onlineIndicator} />
              </View>
              
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerText}>Job Align AI</Text>
                <Text style={styles.subheading}>Your career assistant</Text>
              </View>
            </View>

            <ImageBackground
              source={require('../../assets/background.png')}
              style={styles.background}
              resizeMode="cover"
            >
              {/* Subtle overlay for better readability */}
              <View style={styles.overlay} />
              
              <View style={[styles.chatContainer, { marginBottom: keyboardHeight }]}>
                {/* Messages List */}
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  renderItem={({ item }) => <ChatMessage message={item} />}
                  keyExtractor={(item) => item.id}
                  style={styles.messagesList}
                  contentContainerStyle={styles.messagesContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                  onContentSizeChange={() => {
                    if (flatListRef.current) {
                      flatListRef.current.scrollToEnd({ animated: true });
                    }
                  }}
                  onLayout={() => {
                    if (flatListRef.current) {
                      flatListRef.current.scrollToEnd({ animated: false });
                    }
                  }}
                  removeClippedSubviews={false}
                />
                
                {/* Typing Indicator */}
                {renderTypingIndicator()}
              </View>

              {/* Input Area with proper bottom spacing */}
              <View style={[
                styles.inputContainer, 
                { 
                  bottom: keyboardHeight,
                  paddingBottom: keyboardHeight > 0 ? 8 : Math.max(insets.bottom, Platform.OS === 'ios' ? 34 : 16)
                }
              ]}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Ask me about your career..."
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    multiline={false}
                    returnKeyType="send"
                    onSubmitEditing={sendMessage}
                    blurOnSubmit={false}
                    maxLength={1000}
                  />
                  
                  <TouchableOpacity 
                    onPress={sendMessage} 
                    style={[
                      styles.sendButton,
                      input.trim() ? styles.sendButtonActive : styles.sendButtonInactive
                    ]}
                    disabled={!input.trim()}
                  >
                    <Ionicons 
                      name="send" 
                      size={22} 
                      color={input.trim() ? "#FFFFFF" : "#9CA3AF"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0077B6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0077B6',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  botImageContainer: {
    position: 'relative',
    marginRight: 14,
  },
  botImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subheading: {
    color: '#B3E5FC',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 1,
    opacity: 0.9,
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 250, 252, 0.3)',
    backdropFilter: 'blur(1px)',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingTop: 20,
    paddingBottom: 16,
    flexGrow: 1,
  },
  typingContainer: {
    paddingBottom: 12,
    paddingLeft: 4,
  },
  typingBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: width * 0.6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  typingText: {
    color: '#64748B',
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 18,
    paddingVertical: 8,
    height: 52,
    shadowColor: '#0077B6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 0,
    paddingRight: 12,
    textAlignVertical: 'center',
    lineHeight: 20,
    fontWeight: '400',
    includeFontPadding: false,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#0077B6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonActive: {
    backgroundColor: '#0077B6',
    transform: [{ scale: 1 }],
  },
  sendButtonInactive: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});

export default ChatScreen;