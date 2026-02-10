import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Button, H3 } from "../../components/typography";
import { useAuth } from "../../contexts/AuthContext";

export default function Settings() {
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await signOut();
              router.replace("/(tabs)/welcome");
            } catch (error) {
              console.error("Error logging out:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <H3 baseSize={24}>Settings</H3>
        </View>

        {/* Logout Button */}
        <View className="px-6 mt-4">
          <Button
            title={isLoggingOut ? "Logging out..." : "Logout"}
            onPress={handleLogout}
            color="blue"
            fontColor="yellow"
            disabled={isLoggingOut}
          />
        </View>
      </ScrollView>
    </View>
  );
}
