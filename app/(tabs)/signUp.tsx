import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, AppState, Dimensions, View } from 'react-native';
import { Button, H1, TextBoxInput } from '../../components/typography';
import { supabase } from '../../utils/supabase';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    if (!displayName.trim()) {
      Alert.alert("Error", "Please enter name.");
      return;
    }

    setIsLoading(true);

    try {
      // Use Supabase signUp
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Supabase signup error:', error);
        Alert.alert('Error', error.message);
        return;
      }

      // If signup succeeded, attempt to store profile in `profiles` table.
      // This is best-effort: if DB write fails, we still allow auth to proceed.
      try {
        const user = data?.user;
        if (user) {
          const { error: insertError } = await supabase.from('profiles').upsert({
            id: user.id,
            username: displayName.trim()
                    });
          if (insertError) {
            console.warn('Failed to save profile to Supabase:', insertError);
          }
        }
      } catch (dbErr) {
        console.warn('Error writing profile to Supabase:', dbErr);
      }

      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            router.push('/(tabs)/landingMain');
          },
        },
      ]);
    } catch (err: any) {
      console.error('Error during signup:', err);
      Alert.alert('Error', err?.message || 'Signup failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register AppState handlers for Supabase auto refresh (only once)
  useEffect(() => {
    const handler = (state: string) => {
      if (state === 'active') {
        // @ts-ignore - startAutoRefresh may not be typed on the client
        supabase.auth.startAutoRefresh?.();
      } else {
        supabase.auth.stopAutoRefresh?.();
      }
    };

    const sub = AppState.addEventListener('change', handler);
    return () => sub.remove();
  }, []);

  const navigateToLogin = () => {
    router.push('/(tabs)/login');
  };

  return (
    <LinearGradient
      colors={['#F3B1AE', '#F5D8B9']}
      locations={[0.3, 0.7]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ height: Dimensions.get('screen').height, width: Dimensions.get('screen').width }}
    >
      <View className="flex-1 justify-center items-center">
        <View className="flex-1 w-full h-full items-center justify-center">
          <H1 className="text-center my-5">Sign Up</H1>

          <TextBoxInput
            placeholder="Name"
            value={displayName}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <TextBoxInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextBoxInput
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />

          <TextBoxInput
            placeholder="Confirm Password"
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <Button
            title={isLoading ? "Creating Account..." : "Sign Up"}
            onPress={handleSignup}
            disabled={isLoading}
          />

          <Button
            title="Back to Login"
            onPress={navigateToLogin}
            disabled={isLoading}
          />
        </View>
      </View>
    </LinearGradient>
  );
}