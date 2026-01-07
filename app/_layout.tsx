import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import type { Session } from '@supabase/supabase-js';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import 'react-native-reanimated';
import '../global.css';
import { supabase } from '../utils/supabase';

import { useColorScheme } from '@/hooks/useColorScheme';


//TIP: to add custom fonts, add the file to the assets/fonts directory and then add them to the useFonts hook below
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Montserrat_700Bold: require('../assets/fonts/Montserrat-Bold.ttf'),
    Montserrat_400Regular: require('../assets/fonts/Montserrat-Regular.ttf'),
    Montserrat_900Bold: require('../assets/fonts/Montserrat-ExtraBold.ttf'),
    Inter_Regular: require('../assets/fonts/Inter_18pt-Regular.ttf'),
    Inter_SemiBold: require('../assets/fonts/Inter_18pt-SemiBold.ttf'),
    Inter_Medium: require('../assets/fonts/Inter_18pt-Medium.ttf')
  });

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
  // get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
  });

  // listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  // AppState-based auto-refresh (template behavior)
  const handler = (state: string) => {
    if (state === 'active') {
      // startAutoRefresh exists on the auth client in JS runtime
      // optional chaining in case of typings mismatch
      (supabase.auth as any).startAutoRefresh?.();
    } else {
      (supabase.auth as any).stopAutoRefresh?.();
    }
  };
  const appStateSub = AppState.addEventListener('change', handler);

  
  return () => {
  subscription?.unsubscribe?.();
    appStateSub.remove();
  };
}, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
