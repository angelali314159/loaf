import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Dimensions, View } from "react-native";
import { Button, H1, TextLineInput } from "../../components/typography";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)/landingMain");
    } catch (err: any) {
      console.error("Error during login:", err);
      Alert.alert("Error", err?.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#F3B1AE", "#F5D8B9"]}
      locations={[0.3, 0.7]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{
        height: Dimensions.get("screen").height,
        width: Dimensions.get("screen").width,
      }}
    >
      <View className="flex-1 justify-center items-center">
        <View className="flex-1 w-full h-full items-center justify-center">
          <H1 className="text-center my-5">LOAF</H1>

          <TextLineInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextLineInput
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />

          <Button
            title={isLoading ? "Signing in..." : "Sign In"}
            onPress={handleLogin}
            disabled={isLoading}
          />

          <Button
            title="Don't have an account? Sign Up"
            onPress={() => router.push("/(tabs)/signUp")}
            disabled={isLoading}
          />
        </View>
      </View>
    </LinearGradient>
  );
}
