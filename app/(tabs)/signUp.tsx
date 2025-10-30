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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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

    if (!displayName.trim() || displayName.trim().length < 3) {
      Alert.alert('Error', 'Please enter a username at least 3 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: displayName.trim(),
            first_name: firstName.trim() || null,
            last_name: lastName.trim() || null,
          },
        },
      });

      if (error) {
        console.error('Supabase signup error:', error);
        Alert.alert('Error', error.message);
        return;
      }

      if (!data?.session) {
        Alert.alert('Check your email', 'Please check your inbox for an email to confirm your account.');
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
            placeholder="Username"
            value={displayName}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextBoxInput
            placeholder="First name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />

          <TextBoxInput
            placeholder="Last name"
            value={lastName}
            onChangeText={setLastName}
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