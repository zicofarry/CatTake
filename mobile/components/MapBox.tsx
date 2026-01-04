import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function MapBox({ mapRef, region, onSelectLocation, selectedCoords }: any) {
  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFillObject}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      initialRegion={region}
      // Mendeteksi klik di area kosong
      onPress={(e) => onSelectLocation(e.nativeEvent.coordinate)}
      // Mendeteksi klik pada ikon POI (Rumah Sakit, Mall, dll)
      onPoiClick={(e) => onSelectLocation(e.nativeEvent.coordinate)}
    >
      <Marker
        coordinate={{
          latitude: selectedCoords.lat,
          longitude: selectedCoords.lng
        }}
        draggable
        onDragEnd={(e) => onSelectLocation(e.nativeEvent.coordinate)}
      />
    </MapView>
  );
}