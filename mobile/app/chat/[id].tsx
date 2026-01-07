import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Tambahkan ini
import apiClient from '@/api/apiClient';

export default function ChatRoomScreen() {
  const { id, name } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await apiClient.get(`/chat/history/${id}`);
      const fetchedMessages = response.data.data;
      setMessages(fetchedMessages);

      // AKALIN: Jika ada pesan, simpan waktu pesan terakhir sebagai "sudah dibaca"
      if (fetchedMessages.length > 0) {
        const latestMsg = fetchedMessages[fetchedMessages.length - 1];
        await AsyncStorage.setItem(`lastRead_${id}`, latestMsg.created_at);
      }
    } catch (error) {
      console.error("Gagal memuat chat:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 4000);
    return () => clearInterval(interval);
  }, [id]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const messageToSend = inputText;
    setInputText('');
    try {
      const response = await apiClient.post('/chat/send', { receiverId: id, message: messageToSend });
      const newMessage = { ...response.data.data, position: 'me' };

      // Update local storage juga saat kita kirim pesan
      await AsyncStorage.setItem(`lastRead_${id}`, newMessage.created_at);

      setMessages(prev => [...prev, newMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      setInputText(messageToSend);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{
          headerTitle: (name as string) || 'Chat',
          headerStyle: { backgroundColor: '#3A5F50' },
          headerTintColor: '#fff',
      }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? (isKeyboardVisible ? 90 : 0) : 90}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#3A5F50" style={{ flex: 1 }} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()}
            renderItem={({ item }) => (
              <View style={[styles.bubbleWrapper, item.position === 'me' ? styles.right : styles.left]}>
                <View style={[styles.bubble, item.position === 'me' ? styles.bubbleRight : styles.bubbleLeft]}>
                  <Text style={[styles.text, item.position === 'me' ? styles.textRight : styles.textLeft]}>{item.message}</Text>
                  <Text style={[styles.time, item.position === 'me' ? {color: 'rgba(255,255,255,0.7)'} : {color: '#999'}]}>
                    {formatTime(item.created_at)}
                  </Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={<Text style={{textAlign:'center', marginTop: 20, color:'#999'}}>Mulai percakapan...</Text>}
          />
        )}

        <View style={[styles.inputBar, { paddingBottom: Platform.OS === 'ios' ? insets.bottom + 10 : (isKeyboardVisible ? 10 : 25) }]}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Tulis pesan..."
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn} disabled={!inputText.trim()}>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  listContent: { padding: 16, paddingBottom: 20 },
  bubbleWrapper: { width: '100%', marginBottom: 10 },
  left: { alignItems: 'flex-start' },
  right: { alignItems: 'flex-end' },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16, elevation: 1 },
  bubbleLeft: { backgroundColor: 'white', borderBottomLeftRadius: 4 },
  bubbleRight: { backgroundColor: '#3A5F50', borderBottomRightRadius: 4 },
  text: { fontSize: 15 },
  textLeft: { color: '#333' },
  textRight: { color: 'white' },
  time: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  inputBar: { flexDirection: 'row', padding: 10, backgroundColor: 'white', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee' },
  input: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20, padding: 10, paddingHorizontal: 16, maxHeight: 100, color: '#1F1F1F' },
  sendBtn: { marginLeft: 10, backgroundColor: '#3A5F50', padding: 10, borderRadius: 20, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
});