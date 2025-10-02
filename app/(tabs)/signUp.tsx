import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Dimensions, View } from 'react-native';
import { Button, H1, TextBoxInput } from '../../components/typography';
import { auth } from '../../firebase/firebaseConfig';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    setIsLoading(true);

    try {
      // Firebase authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('User signed up successfully:', user.uid);
      Alert.alert(
        "Success", 
        "Account created successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              // TO-DO: Navigate to main app or onboarding
            }
          }
        ]
      );

    } catch (error: any) {
      console.error("Error during signup:", error);
      
      let errorMessage = "An unexpected error occurred.";
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "This email is already registered. Please use a different email or try logging in.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password is too weak. Please choose a stronger password.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your internet connection.";
          break;
        default:
          errorMessage = error.message || "Signup failed. Please try again.";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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

          {/* Email Input */}
          <TextBoxInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* Password Input */}
          <TextBoxInput
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            onChangeText={(text) => setPassword(text)}
          />

          {/* Confirm Password Input */}
          <TextBoxInput
            placeholder="Confirm Password"
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
          />

          {/* Sign Up Button */}
          <Button
            title={isLoading ? "Creating Account..." : "Sign Up"}
            onPress={handleSignup}
            disabled={isLoading}
          />

          {/* Back to Login Button */}
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