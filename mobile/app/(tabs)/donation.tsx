import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function DonationScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Donasi' }} />
      <View style={styles.center}>
        <Text style={styles.title}>💰 Donasi</Text>
        <Text>Bantu shelter merawat anabul.</Text>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 }
});