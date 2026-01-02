import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// MOCK ISI CHAT
const INITIAL_MESSAGES = [
  { id: '1', text: 'Halo kak, apakah kucing ini masih ada?', sender: 'me', time: '10:30' },
  { id: '2', text: 'Halo! Masih ada kak, silakan mampir.', sender: 'shelter', time: '10:32' },
];

export default function ChatRoomScreen() {
  const { name } = useLocalSearchParams(); 
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        headerTitle: (name as string) || 'Chat',
        headerTintColor: '#3A5F50',
      }} />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.bubbleWrapper, item.sender === 'me' ? styles.right : styles.left]}>
            <View style={[styles.bubble, item.sender === 'me' ? styles.bubbleRight : styles.bubbleLeft]}>
              <Text style={[styles.text, item.sender === 'me' ? styles.textRight : styles.textLeft]}>
                {item.text}
              </Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

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
  time: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end', opacity: 0.7 },
  inputBar: { flexDirection: 'row', padding: 10, backgroundColor: 'white', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20, padding: 10, paddingHorizontal: 16 },
  sendBtn: { marginLeft: 10, backgroundColor: '#3A5F50', padding: 10, borderRadius: 20 },
});