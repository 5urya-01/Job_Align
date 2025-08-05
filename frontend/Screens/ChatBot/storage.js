import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'chat_history';

export const saveMessages = async (messages) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error("Saving error", e);
  }
};

export const loadMessages = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Loading error", e);
    return [];
  }
};
