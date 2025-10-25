 
import { createClient, processLock } from '@supabase/supabase-js';

// Detect React Native environment. In RN, `navigator.product === 'ReactNative'`.
const isReactNative = typeof navigator !== 'undefined' && (navigator as any).product === 'ReactNative';

// Only require AsyncStorage when running in React Native. Using a conditional
// require prevents bundlers for web/node from importing the native AsyncStorage
// module which references `window` and causes `ReferenceError: window is not defined`.
let storage: any = undefined;
if (isReactNative) {
  try {
    storage = require('@react-native-async-storage/async-storage').default;
  } catch {
    storage = undefined;
  }
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  }
)
