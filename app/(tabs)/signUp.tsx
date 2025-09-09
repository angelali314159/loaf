import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5050/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        console.error(message);
        Alert.alert("Error", "Signup failed.");
        return;
      }

      Alert.alert("Success", "Signup successful!");
    } catch (error) {
      console.error("Error during signup:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  return (
    <LinearGradient
      colors={['#F3B1AE', '#F5D8B9']}
      locations={[0.3, 0.7]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ height: Dimensions.get('screen').height, width: Dimensions.get('screen').width }}
    >
      <View style={styles.container}>
        <View style={styles.main}>
          <Text style={styles.title}>Sign Up</Text>

          {/* Username Input */}
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#F9F6EE"
            value={username}
            onChangeText={(text) => setUsername(text)}
            autoCapitalize="none"
          />

          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#F9F6EE"
            secureTextEntry={true}
            value={password}
            onChangeText={(text) => setPassword(text)}
          />

          {/* Confirm Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#F9F6EE"
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
          />

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.buttons} onPress={handleSignup}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Navigate to Login */}
          <TouchableOpacity style={styles.buttons}>
            <Text style={styles.buttonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  main: {
    flex: 1,
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: "#F9F6EE",
    fontSize: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    fontFamily: 'Montserrat_700Bold',
  },
  input: {
    width: 300,
    height: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginVertical: 10,
    fontSize: 13,
    color: "#333",
    alignItems: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  buttons: {
    width: 200,
    height: 30,
    backgroundColor: '#F9F6EE',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 1, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 15,
    color: "#38434D",
    shadowColor: 'black',
    fontFamily: 'Montserrat_400Regular',
  },
});
