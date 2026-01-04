import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../constants/Colors'; // Pastikan path ini sesuai dengan struktur folder kamu

const { width } = Dimensions.get('window');

interface CustomPopupProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export default function CustomPopup({ 
  visible, 
  onClose, 
  title, 
  message, 
  type = 'success' 
}: CustomPopupProps) {

  // Tentukan warna dan icon berdasarkan tipe modal
  let iconName: keyof typeof FontAwesome.glyphMap = 'check-circle';
  let color = Colors.success; // Default hijau dari Colors.ts

  switch (type) {
    case 'error':
      iconName = 'times-circle';
      color = Colors.danger; // Default merah dari Colors.ts
      break;
    case 'info':
      iconName = 'info-circle';
      color = Colors.primary; // Orange
      break;
    default:
      iconName = 'check-circle';
      color = Colors.success;
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          {/* Header Icon */}
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <FontAwesome name={iconName} size={40} color="white" />
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={[styles.title, { color: color }]}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Button */}
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: color }]} 
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Latar belakang gelap transparan
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
    marginTop: 20, // Memberi ruang untuk icon yang menonjol keluar (opsional)
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: -40, // Membuat icon setengah keluar di atas
    borderWidth: 4,
    borderColor: 'white', // Memberi outline putih pada lingkaran icon
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#6B7280', // Text gray
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});