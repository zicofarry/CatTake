import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: {
          height: 80, 
          paddingBottom: 15, 
          paddingTop: 10,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: '#ffffff',
          position: 'absolute',
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
          marginBottom: 5, 
        }
      }}
    >
      {/* 1. BERANDA */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* 2. KOMUNITAS */}
      <Tabs.Screen
        name="community"
        options={{
          title: 'Komunitas', 
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* 3. RESCUE (TOMBOL TENGAH) */}
      <Tabs.Screen
        name="report"
        options={{
          title: '', 
          tabBarLabel: () => null, 
          tabBarIcon: ({ focused }) => (
            <View style={styles.middleButton}>
              <Ionicons name="medkit" size={30} color="white" />
            </View>
          ),
        }}
      />

      {/* 4. CHAT */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* 5. PROFIL */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* -- HALAMAN TERSEMBUNYI -- */}
      <Tabs.Screen name="donation" options={{ href: null }} />
      <Tabs.Screen name="faq" options={{ href: null }} />
      <Tabs.Screen name="adopt" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  middleButton: {
    top: -30, 
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary, 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, 
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    borderWidth: 4,
    borderColor: '#f3f4f6', 
  }
});