import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function ReportScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>📷 Lapor Rescue</Text>
      <Text>Fitur pelaporan akan segera hadir di sini.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: Colors.primary }
});
