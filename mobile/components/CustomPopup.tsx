// mobile/components/CustomPopup.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface CustomPopupProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export default function CustomPopup({ visible, onClose, title, message, type = 'success' }: CustomPopupProps) {
  let iconName = 'check';
  let statusColor = Colors.success;

  // Logika penentuan warna berdasarkan type
  if (type === 'error') {
    iconName = 'exclamation-circle';
    statusColor = Colors.danger; // Merah
  } else if (type === 'info') {
    iconName = 'info-circle';
    statusColor = Colors.success; // Oranye
  }

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-center items-center">
        {/* Container Utama Kartu */}
        <View className="w-[85%] bg-white rounded-[30px] p-8 items-center shadow-xl">

          {/* Header Icon - Layout dalam kartu */}
          <View
            className="w-16 h-16 rounded-full justify-center items-center mb-6"
            style={{ backgroundColor: statusColor }}
          >
            <FontAwesome5 name={iconName} size={30} color="white" />
          </View>

          {/* Content */}
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-slate-800 mb-2 text-center">{title}</Text>
            <Text className="text-base text-slate-500 text-center leading-5">{message}</Text>
          </View>

          {/* Button - WARNA DINAMIS BERDASARKAN STATUS */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            className="w-full py-4 rounded-2xl items-center"
            style={{ backgroundColor: statusColor }} // Bagian yang diubah
          >
            <Text className="text-white font-bold text-lg">Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}