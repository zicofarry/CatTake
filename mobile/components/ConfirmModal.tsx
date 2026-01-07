import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  type = 'danger',
  icon = 'trash-outline'
}: ConfirmModalProps) {
  
  // Tentukan warna berdasarkan tipe aksi
  const themeColor = type === 'danger' ? '#FF4757' : type === 'warning' ? '#EBCD5E' : '#3A5F50';

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-center items-center">
        <View className="w-[85%] bg-white rounded-[30px] p-6 items-center shadow-2xl">
          
          {/* Icon Container */}
          <View 
            className="w-16 h-16 rounded-full justify-center items-center mb-4"
            style={{ backgroundColor: themeColor }}
          >
            <Ionicons name={icon} size={30} color="white" />
          </View>

          {/* Text Content */}
          <Text className="text-xl font-bold text-slate-800 mb-2 text-center">{title}</Text>
          <Text className="text-sm text-slate-500 text-center leading-5 mb-8 px-2">{message}</Text>

          {/* Footer Buttons */}
          <View className="flex-row gap-3 w-full">
            <TouchableOpacity 
              onPress={onClose}
              className="flex-1 py-4 rounded-2xl bg-slate-100 items-center"
            >
              <Text className="text-slate-500 font-bold">{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onConfirm}
              className="flex-2 py-4 rounded-2xl items-center"
              style={{ backgroundColor: themeColor, flex: 1.5 }}
            >
              <Text className="text-white font-bold">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}