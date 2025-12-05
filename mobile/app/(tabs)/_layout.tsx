import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary, // Orange saat aktif
        tabBarInactiveTintColor: '#9ca3af', // Abu-abu saat tidak aktif
        headerShown: false, // Header diatur di masing-masing halaman
        tabBarStyle: {
          height: 70, // Sedikit lebih tinggi biar tombol tengah muat
          paddingBottom: 10,
          paddingTop: 10,
          borderTopLeftRadius: 20, // Opsional: Sudut melengkung di atas
          borderTopRightRadius: 20,
          backgroundColor: '#ffffff',
          position: 'absolute', // Biar background di belakangnya tembus (opsional)
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        }
      }}
    >
      {/* 1. HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* 2. ADOPT (List Kucing) */}
      <Tabs.Screen
        name="adopt"
        options={{
          title: 'Adopt',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "paw" : "paw-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* 3. LAPOR (TOMBOL TENGAH SPESIAL) */}
      <Tabs.Screen
        name="report"
        options={{
          title: '', // Kosongkan label
          tabBarLabel: () => null, // Benar-benar hapus labelnya
          tabBarIcon: ({ focused }) => (
            <View style={styles.middleButton}>
              <Ionicons name="camera" size={32} color="white" />
            </View>
          ),
        }}
      />

      {/* 4. KOMUNITAS */}
      <Tabs.Screen
        name="community"
        options={{
          title: 'Komunitas',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* 5. PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Akun',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* -- HALAMAN TERSEMBUNYI (Hidden Tabs) -- */}
      
      {/* Donasi (Diakses dari Home) */}
      <Tabs.Screen
        name="donation"
        options={{ href: null }} 
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  middleButton: {
    top: -20, // Naik ke atas
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow supaya terlihat melayang
    elevation: 5, 
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    borderWidth: 4,
    borderColor: '#f3f4f6', // Warna border nyatu sama background app
  }
});