import React from 'react';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onPress: (e: any) => void; // Gunakan any atau gabungan tipe event
}

export default function LocationPicker({ latitude, longitude, onPress }: LocationPickerProps) {
  return (
    <MapView
      style={{ width: '100%', height: '100%' }}
      // initialRegion hanya jalan saat pertama kali render
      initialRegion={{
        latitude: latitude || -6.9175,
        longitude: longitude || 107.6191,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      // Ini kunci agar titik di peta bisa diklik
      onPress={onPress}
      onPoiClick={onPress} 
      // Opsional: munculkan titik biru lokasi user saat ini
      showsUserLocation={true}
      showsMyLocationButton={true}
    >
      <Marker 
        coordinate={{ latitude, longitude }} 
        pinColor="red"
      />
    </MapView>
  );
}