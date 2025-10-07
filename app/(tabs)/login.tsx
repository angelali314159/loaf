import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Dimensions, View } from 'react-native';
import { Button, H1, TextBoxInput } from '../../components/typography';
import { signInUser } from '../../firebase/auth';
import { auth } from '../../firebase/firebaseConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInUser(email, password);
      const user = userCredential.user;
      
      console.log('User signed in successfully:', user.uid);
      Alert.alert(
        "Success", 
        "Welcome back!",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate to main app
              router.push('/(tabs)/landingMain');
            }
          }
        ]
      );

    } catch (error: any) {
      console.error("Error during login:", error);
      
      let errorMessage = "An unexpected error occurred.";
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email. Please check your email or sign up.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password. Please try again.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled. Please contact support.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your internet connection.";
          break;
        case 'auth/invalid-credential':
          errorMessage = "Invalid email or password. Please try again.";
          break;
        default:
          errorMessage = error.message || "Login failed. Please try again.";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address first.");
      return;
    }
  
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Success", "Password reset email sent! Check your inbox.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send password reset email.");
    }
  };

  const navigateToSignUp = () => {
    router.push('/(tabs)/signUp');
  };

  return (
    <LinearGradient 
      colors={['#F3B1AE', '#F5D8B9']} 
      locations={[0.3, 0.7]} 
      start={{x: 0, y: 0}} 
      end={{x: 0, y: 1}} 
      style={{height: Dimensions.get('screen').height, width: Dimensions.get('screen').width}}
    >
      <View className="flex-1 justify-center items-center">
        <View className="flex-1 w-full h-full items-center justify-center">
          <H1 className="text-center my-5">LOAF</H1>
        
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

          <Button
            title={isLoading ? "Signing In..." : "Login"}
            onPress={handleLogin}
            disabled={isLoading}
          />

          <Button
            title="Forgot Password"
            onPress={handleForgotPassword}
            disabled={isLoading}
          />

          <Button
            title="Don't have an account? Sign Up"
            onPress={navigateToSignUp}
            disabled={isLoading}
          />

        </View>
      </View>
    </LinearGradient>
  );
}