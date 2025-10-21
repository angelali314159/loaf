import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, View } from 'react-native';
import { Button, H1, TextBoxInput } from '../../components/typography';
import { createUserWithProfile } from '../../firebase/scripts/addUser';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "Please enter your first and last name.");
      return;
    }

    setIsLoading(true);

    try {
      await createUserWithProfile(email, password, firstName.trim(), lastName.trim());
      Alert.alert("Success", "Account created successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.push('/(tabs)/landingMain');
          }
        }
      ]);

    } catch (error: any) {
      console.error("Error during signup:", error);
      
      let errorMessage = "An unexpected error occurred.";
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "This email is already registered.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password is too weak.";
          break;
        default:
          errorMessage = error.message || "Signup failed.";
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

          <TextBoxInput
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />

          <TextBoxInput
            placeholder="Last Name"
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