import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { AppState, Dimensions, Image, View, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import PopupMessage from '../../components/PopupMessage';
import { Button, H1, H2, P, TextLineInput } from '../../components/typography';
import { supabase } from '../../utils/supabase';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [popup, setPopup] = useState<{
    visible: boolean;
    title?: string;
    message: string;
    type: 'error' | 'success' | 'info';
  }>({ visible: false, message: '', type: 'info' });

  const showPopup = (message: string, type: 'error' | 'success' | 'info' = 'info', title?: string) => {
    setPopup({ visible: true, message, type, title });
  };

  const hidePopup = () => {
    setPopup(prev => ({ ...prev, visible: false }));
  };

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
      showPopup("Please fill in all fields.", 'error', 'Validation Error');
      return;
    }

    if (password !== confirmPassword) {
      showPopup("Passwords do not match.", 'error', 'Validation Error');
      return;
    }

    if (password.length < 6) {
      showPopup("Password must be at least 6 characters long.", 'error', 'Validation Error');
      return;
    }

    if (!displayName.trim() || displayName.trim().length < 3) {
      showPopup('Please enter a username at least 3 characters long.', 'error', 'Validation Error');
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
            username: displayName.trim()
          },
        },
      });

      if (error) {
        console.error('Supabase signup error:', error);
        showPopup(error.message || 'An error occurred during signup.', 'error', 'Signup Error');
        return;
      }

      if (!data?.session) {
        showPopup('Please check your inbox for an email to confirm your account.', 'info', 'Check Your Email');
      } else {
        showPopup('Account created successfully!', 'success', 'Welcome!');
        // Navigate after a short delay to let user see the success message
        setTimeout(() => {
          router.push('/(tabs)/landingMain');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error during signup:', err);
      showPopup(err?.message || 'Signup failed.', 'error', 'Error');
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
    <View className="flex-1 bg-white justify-center">

      {/* SEMICIRCLE GRADIENT BACKGROUND */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 0 }}>
        <Svg height={Dimensions.get('screen').height * .5} width={Dimensions.get('screen').width}>
          <Defs>
            <RadialGradient
              id="topSemiCircle"
              cx="50%" //centered horizontally
              cy="0%" //top edge
              rx="150%" //horiztonal radius
              ry="70%" //vertical radius
              gradientUnits="objectBoundingBox"
            >
              <Stop offset="0%" stopColor="#FCDE8C" stopOpacity={.9} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={.1} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#topSemiCircle)" />
        </Svg>
      </View>

      {/* MAIN CONTENT */}
      <View className="flex-1 w-full h-full items-start justify-center" style={{ paddingHorizontal: '6%', zIndex: 1 }}>

        <Image
          source={require('../../assets/images/cat_with_pink_ball.png')}
          style={{
            height: Dimensions.get('screen').height * 0.06,
            width: Dimensions.get('screen').width * 0.18,
            marginBottom: 15
          }}
          resizeMode="contain"
        />

        <H1 baseSize={25} className="text-left mb-[0.5rem]">Create account</H1>
        <H2 baseSize={12} className="text-left mb-[2rem]">The best decision you&apos;ve made</H2>

        <P>Email Address</P>
        <TextLineInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <P className="mt-[1rem]">Password</P>
        <View style={styles.passwordWrapper}>
          <TextLineInput
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={styles.passwordInput}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/images/eye.svg')}
              style={styles.eyeImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <P className="mt-[1rem]">Confirm Password</P>
        <View style={styles.passwordWrapper}>
          <TextLineInput
            placeholder="Confirm Password"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.passwordInput}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/images/eye.svg')}
              style={styles.eyeImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <P className="mt-[1rem]">Username</P>
        <TextLineInput
          placeholder="Username"
          value={displayName}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <View style={{ height: Dimensions.get('window').height * 0.06 }} />

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

      <PopupMessage
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={hidePopup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  passwordWrapper: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    top: 8,
    padding: 4,
  },
  eyeImage: {
    width: 24,
    height: 24,
    paddingBottom: 8,
  },
});