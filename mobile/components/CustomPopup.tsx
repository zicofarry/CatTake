// mobile/components/CustomPopup.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, Dimensions } from 'react-native';
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

  if (type === 'error') {
    iconName = 'exclamation-circle';
    statusColor = Colors.danger;
  } else if (type === 'info') {
    iconName = 'info-circle';
    statusColor = Colors.primary;
  }

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-center items-center">
        <View className="w-[85%] bg-white rounded-[30px] px-6 pb-6 pt-12 items-center shadow-xl relative">
          
          {/* Header Icon Floating */}
          <View 
            className="w-20 h-20 rounded-full justify-center items-center absolute -top-10 border-4 border-white"
            style={{ backgroundColor: statusColor }}
          >
            <FontAwesome5 name={iconName} size={30} color="white" />
          </View>

          {/* Content */}
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-slate-800 mb-2 text-center">{title}</Text>
            <Text className="text-base text-slate-500 text-center leading-5">{message}</Text>
          </View>

          {/* Button */}
          <TouchableOpacity 
            onPress={onClose}
            activeOpacity={0.8}
            className="w-full py-4 rounded-2xl items-center"
            style={{ backgroundColor: Colors.primary }}
          >
            <Text className="text-white font-bold text-lg">Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}