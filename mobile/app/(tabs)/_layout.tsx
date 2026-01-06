import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Warna aktif hijau sesuai Colors.success (#10b981)
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        // Desain flat dengan tinggi yang cukup dan padding bawah
        tabBarStyle: {
          height: 85,
          paddingBottom: 25,
          paddingTop: 0, // Dibuat 0 agar indikator garis menempel ke atas
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 8, // Mengatur jarak teks dengan ikon
        }
      }}
    >
      {/* 1. BERANDA */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "home" : "home-outline"} color={color} focused={focused} />
          ),
        }}
      />

      {/* 2. KOMUNITAS */}
      <Tabs.Screen
        name="community"
        options={{
          title: 'Komunitas',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "people" : "people-outline"} color={color} focused={focused} />
          ),
        }}
      />

      {/* 3. LAPOR (Dibuat rata & memiliki indikator yang sama) */}
      <Tabs.Screen
        name="report"
        options={{
          title: 'Lapor',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "medkit" : "medkit-outline"} color={color} focused={focused} />
          ),
        }}
      />

      {/* 4. CHAT */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "chatbubble" : "chatbubble-outline"} color={color} focused={focused} />
          ),
        }}
      />

      {/* 5. PROFIL */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "person" : "person-outline"} color={color} focused={focused} />
          ),
        }}
      />

      {/* -- HALAMAN TERSEMBUNYI -- */}
      <Tabs.Screen name="donation" options={{ href: null }} />
      <Tabs.Screen name="faq" options={{ href: null }} />
      <Tabs.Screen name="adopt" options={{ href: null }} />
      <Tabs.Screen name="history" options={{href: null }}/>
    </Tabs>
  );
}

/**
 * Komponen Helper untuk Ikon dengan Indikator Garis Atas
 */
function TabIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      {/* Garis Indikator Hijau (Hanya muncul jika aktif) */}
      {focused && <View style={styles.activeIndicator} />}
      <Ionicons name={name} size={24} color={color} style={{ marginTop: 10 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 100,
  },
  activeIndicator: {
    position: 'absolute',
    top: 30,
    width: 40, // Lebar garis indikator
    height: 3, // Ketebalan garis
    backgroundColor: '#10b981', // Hijau indikator
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});