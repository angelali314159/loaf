import { router } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { Button } from "../../components/typography";
import { useAuth } from "../../contexts/AuthContext";

export default function Welcome() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/landingMain");
    }
  }, [isAuthenticated]);

  return (
    <View>
      <Button
        title="Go to Login"
        onPress={() => router.push("/(tabs)/login")}
      />
      <Button
        title="Go to Sign Up"
        onPress={() => router.push("/(tabs)/signUp")}
      />
    </View>
  );
}
