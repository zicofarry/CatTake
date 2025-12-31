import { View, Text, StyleSheet } from 'react-native';
export default function ProfileScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>👤 Akun Saya</Text>
      <Text>Login untuk mengelola profil.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 }
});