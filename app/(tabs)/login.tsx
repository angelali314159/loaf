import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View, Image, TouchableOpacity, Text, TextInput, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../utils/supabase';

const { width } = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigateToSignUp = () => {
    router.push('/(tabs)/signUp');
  };

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
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
        Alert.alert('Error', error.message);
        return;
      }

      if (!data?.session) {
        Alert.alert('Check your email', 'Please check your inbox for a login/confirmation email.');
        return;
      }

      router.push('/(tabs)/landingMain');
    } catch (err: any) {
      console.error('Error during login:', err);
      Alert.alert('Error', err?.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset functionality coming soon!');
  };

  return (
    <View style={styles.container}>
      {/* Circular yellow glow - simulating radial gradient */}
      <LinearGradient
        colors={['rgba(252, 222, 140, 0.4)', 'rgba(252, 222, 140, 0.25)', 'rgba(252, 222, 140, 0.1)', 'rgba(255, 255, 255, 0)']}
        locations={[0, 0.3, 0.6, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.yellowGlow, { left: (width / 2) - 400 }]}
      />

      <View style={styles.contentContainer}>
        {/* Cat Image */}
        <View style={styles.catContainer}>
          <Image
            source={require('../../assets/images/cat_with_pink_ball.png')}
            style={styles.catImage}
            resizeMode="contain"
          />
        </View>

        {/* Login Title */}
        <Text style={styles.title}>Login</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>You're back, we missed you!</Text>

        {/* Email Address Label */}
        <Text style={styles.label}>Email Address</Text>

        {/* Email Input - wrapped to prevent focus outline */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="JennaSmith@gmail.com"
            placeholderTextColor="#C7C7C7"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            selectionColor="#2D3541"
            underlineColorAndroid="transparent"
          />
          <View style={styles.underline} />
        </View>

        {/* Password Label */}
        <Text style={styles.label}>Password</Text>

        {/* Password Input with Eye Icon */}
        <View style={styles.inputContainer}>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="***********"
              placeholderTextColor="#C7C7C7"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              selectionColor="#2D3541"
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              activeOpacity={0.7}
            >
              <View style={styles.eyeIconContainer}>
                <View style={styles.eyeOutline}>
                  <View style={styles.eyePupil} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.underline} />
        </View>

        {/* Forgot Password */}
        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotPassword}
          activeOpacity={0.7}
        >
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
          style={[styles.button, isLoading && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Signing in...' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  yellowGlow: {
    position: 'absolute',
    top: -400,
    width: 800,
    height: 800,
    borderRadius: 400,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  catContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  catImage: {
    width: 100,
    height: 100,
  },
  title: {
    fontFamily: 'Montserrat_900Bold',
    fontSize: 48,
    color: '#2D3541',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_Regular',
    fontSize: 16,
    marginBottom: 40,
    color: '#2D3541',
  },
  label: {
    fontFamily: 'Inter_Regular',
    fontSize: 16,
    marginBottom: 8,
    color: '#2D3541',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    fontSize: 16,
    fontFamily: 'Inter_Regular',
    color: '#2D3541',
    borderWidth: 0,
    outline: 'none',
    boxShadow: 'none',
  } as any,
  underline: {
    height: 1,
    backgroundColor: '#D1D1D1',
    width: '100%',
  },
  passwordWrapper: {
    position: 'relative',
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
  eyeIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeOutline: {
    width: 20,
    height: 12,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyePupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 40,
    marginTop: 4,
  },
  forgotPasswordText: {
    fontFamily: 'Inter_Regular',
    fontSize: 16,
    color: '#2D3541',
  },
  button: {
    alignSelf: 'center',
    width: '90%',
    maxWidth: 520,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: '#fcde8c',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#2D3541',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter_Regular',
  },
});