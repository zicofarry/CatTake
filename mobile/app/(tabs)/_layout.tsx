import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // Tambahkan state role

  // Cek status login dan role saat komponen dimuat
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole'); // Ambil role dari AsyncStorage
        
        setIsLoggedIn(!!token);
        setUserRole(role);
      } catch (error) {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };
    checkUserStatus();
  }, []);

  if (isLoggedIn === null) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: {
          height: 85,
          paddingBottom: 25,
          paddingTop: 0,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 8,
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

      {/* 3. LAPOR - Disembunyikan jika role adalah 'shelter' */}
      <Tabs.Screen
        name="report"
        options={{
          title: 'Lapor',
          href: userRole === 'shelter' ? null : undefined, // LOGIKA: Jika shelter, hilangkan tab
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
          href: isLoggedIn ? undefined : null,
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
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen name="halloffame" options={{ href: null }} />
      <Tabs.Screen name="all-shelters" options={{ href: null }} />
    </Tabs>
  );
}

// ... komponen TabIcon dan styles tetap sama ...
function TabIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
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
    width: 40,
    height: 3,
    backgroundColor: '#10b981',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});