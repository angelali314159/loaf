import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, AppState, View } from 'react-native';
import { Button, H1, H2, P, TextLineInput } from '../../components/typography';
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

    //TESTING CODE FOR PULLING INFO FROM SUPABASE
    let { data: exercise_library, error } = await supabase
      .from('exercise_library')
      .select('name')
    console.log('Exercise Library:', exercise_library);
    if (error) {
      console.error('Error fetching exercise library:', error);
    }
    //*************************************************** */

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

    // Attempt to sign up the user with Supabase
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
      <View className="flex-1 justify-center bg-white" >
        <View className="flex-1 w-full h-full items-start justify-center" style={{paddingHorizontal: '5%'}}>
          <H1 baseSize={25} className="text-left mb-[0.5rem]">Create account</H1>
          <H2 baseSize={12} className="text-left mb-[2rem]">The best decision you&apos;ve made</H2>
            <P >Email Address</P>

            <TextLineInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />


            <P className="mt-[1rem]">Password</P>

            <TextLineInput
              placeholder="Password"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />

            <P className="mt-[1rem]">Confirm Password</P>
            <TextLineInput
              placeholder="Confirm Password"
              secureTextEntry={true}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <P className="mt-[1rem]">Username</P>
            <TextLineInput
              placeholder="Username"
              value={displayName}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <View className="mt-[2rem]"/>

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
  );
}