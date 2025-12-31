import { View, Text, StyleSheet } from 'react-native';
export default function CommunityScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>👥 Komunitas</Text>
      <Text>Forum diskusi pecinta kucing.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 }
});
