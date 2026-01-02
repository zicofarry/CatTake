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
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/api/apiClient';

export default function ChatRoomScreen() {
  const { id, name } = useLocalSearchParams(); // 'id' di sini adalah partner_id lawan bicara
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Ambil riwayat chat dari backend
  const fetchHistory = async () => {
    try {
      const response = await apiClient.get(`/chat/history/${id}`);
      setMessages(response.data.data); // Data dari ShelterChatController.getHistory
    } catch (error) {
      console.error("Gagal memuat chat:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Polling sederhana untuk mendapatkan pesan baru setiap 4 detik
    const interval = setInterval(fetchHistory, 4000);
    return () => clearInterval(interval);
  }, [id]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const messageToSend = inputText;
    setInputText('');

    try {
      const response = await apiClient.post('/chat/send', {
        receiverId: id,
        message: messageToSend
      });

      // Tambahkan pesan ke UI secara langsung
      setMessages(prev => [...prev, response.data.data]);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
      setInputText(messageToSend); // Kembalikan teks jika gagal
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerTitle: (name as string) || 'Chat' }} />

      {loading ? (
        <ActivityIndicator size="large" color="#3A5F50" style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.bubbleWrapper, item.position === 'me' ? styles.right : styles.left]}>
              <View style={[styles.bubble, item.position === 'me' ? styles.bubbleRight : styles.bubbleLeft]}>
                <Text style={[styles.text, item.position === 'me' ? styles.textRight : styles.textLeft]}>
                  {item.message}
                </Text>
                <Text style={[styles.time, item.position === 'me' ? {color: '#eee'} : {color: '#999'}]}>
                  {formatTime(item.created_at)}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Tulis pesan..."
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ... Styles tetap sama seperti kode asli kamu ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  listContent: { padding: 16 },
  bubbleWrapper: { width: '100%', marginBottom: 10 },
  left: { alignItems: 'flex-start' },
  right: { alignItems: 'flex-end' },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  bubbleLeft: { backgroundColor: 'white', borderBottomLeftRadius: 4 },
  bubbleRight: { backgroundColor: '#3A5F50', borderBottomRightRadius: 4 },
  text: { fontSize: 15 },
  textLeft: { color: '#333' },
  textRight: { color: 'white' },
  time: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  inputBar: { flexDirection: 'row', padding: 10, backgroundColor: 'white', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20, padding: 10, paddingHorizontal: 16 },
  sendBtn: { marginLeft: 10, backgroundColor: '#3A5F50', padding: 10, borderRadius: 20 },
});