
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  const profileImage = isUser
    ? require('../../assets/images/bot.jpg')   // 🔁 replace with your user image
    : require('../../assets/images/bot.jpg');    // 🔁 replace with your bot image

  return (
    <View
      style={[
        styles.messageRow,
        { justifyContent: isUser ? 'flex-end' : 'flex-start' },
      ]}
    >
      {/* {!isUser && <Image source={profileImage} style={styles.avatar} />} */}
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: isUser ? '#0077B6' : '#fff',
            alignSelf: isUser ? 'flex-end' : 'flex-start',
            borderTopLeftRadius: isUser ? 15 : 0,
            borderTopRightRadius: isUser ? 0 : 15,
          },
        ]}
      >
        <Text style={{ color: isUser ? '#fff' : '#000' }}>{message.text}</Text>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 6,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default ChatMessage; // ✅ make sure this is default export
