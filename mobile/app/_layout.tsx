import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

// Mencegah splash screen hilang otomatis sebelum font siap
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    // Kalau kamu punya font custom, load di sini. 
    // Kalau belum ada, biarkan default dulu (SpaceMono bawaan expo bisa dihapus kalau gak ada filenya)
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // if (!loaded) {
  //   return null;
  // }

  return (
    <Stack>
      {/* (tabs) = Halaman Utama yang ada menu bawahnya. 
        headerShown: false -> karena kita mau header diatur per-tab.
      */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* (auth) = Halaman Login/Register. Gak butuh header back. */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />

      {/* Halaman Detail (misal: adopt/[id]) butuh tombol back */}
      <Stack.Screen name="adopt/[id]" options={{ title: 'Detail Kucing' }} />
      
      {/* Halaman Not Found */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}