import React from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onPress: (e: MapPressEvent) => void;
}

export default function LocationPicker({ latitude, longitude, onPress }: LocationPickerProps) {
  return (
    <MapView
      style={{ width: '100%', height: '100%' }}
      initialRegion={{
        latitude: latitude || -6.9175,
        longitude: longitude || 107.6191,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      onPress={onPress}
    >
      <Marker coordinate={{ latitude, longitude }} />
    </MapView>
  );
}