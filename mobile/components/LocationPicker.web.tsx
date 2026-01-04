import React from 'react';
import { View, Text } from 'react-native';

export default function LocationPicker() {
  return (
    <View className="flex-1 justify-center items-center bg-gray-200">
      <Text className="text-gray-500 text-center px-4">
        Peta tidak tersedia di Web Browser.{"\n"}
        Silakan buka di Android/iOS Simulator.
      </Text>
    </View>
  );
}