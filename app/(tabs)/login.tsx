import { router } from 'expo-router';
import React, { useState } from 'react';
import {Dimensions, Image, View, TouchableOpacity, StyleSheet} from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import PopupMessage from '../../components/PopupMessage';
import { Button, H1, H2, P, TextLineInput } from '../../components/typography';
import { supabase } from '../../utils/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const navigateToSignUp = () => {
    router.push('/(tabs)/signUp');
  };

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      showPopup("Please fill in all fields.", 'error', 'Validation Error');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Supabase sign-in error:', error);
        showPopup(error.message);
        return;
      }

      if (!data?.session) {
        showPopup('Please check your inbox for a login/confirmation email.');
        return;
      }

      router.push('/(tabs)/landingMain');
    } catch (err: any) {
      console.error('Error during login:', err);
     showPopup(err?.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showPopup("Please enter your email address first.", "error", "Enter Email");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showPopup("Password reset email sent. Please check your inbox.", 'success', "Enter Sent");
    } catch (error: any) {
      showPopup("Password reset email failed to send.", 'error', "Error sending email");
    }
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


        <H1 baseSize={25} className="text-left mb-[0.5rem]">Login</H1>
        <H2 baseSize={12} className="text-left mb-[2rem]">You&apos;re back, we've missed you!</H2>

        {/* Email Address */}
        <P>Email Address</P>
        <TextLineInput
          placeholder="JennaSmith@gmail.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* Password */}
        <P className="mt-[1rem]">Password</P>
        <View style={styles.passwordWrapper}>
          <TextLineInput
            placeholder="***********"
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

        {/* Forgot Password */}
        <TouchableOpacity
          onPress={handleForgotPassword}
          activeOpacity={0.7}
        >

        <View style={{ height: Dimensions.get('window').height * 0.02 }} />

        <P>Forgot password?</P>
        </TouchableOpacity>

        <View style={{ height: Dimensions.get('window').height * 0.06 }} />

        {/* Login Button */}
        <Button
          title={isLoading ? 'Signing in...' : 'Login'}
          onPress={handleLogin}
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