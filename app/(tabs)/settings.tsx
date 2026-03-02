import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import PopupMessage from "../../components/PopupMessage";
import { Button, H3 } from "../../components/typography";
import { useAuth } from "../../contexts/AuthContext";

export default function Settings() {
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = async () => {
    setShowConfirm(false);
    try {
      setIsLoggingOut(true);
      await signOut();
      router.replace("/(tabs)/welcome");
    } catch (error) {
      console.error("Error logging out:", error);
      setShowError(true);
    } finally {
      setIsLoggingOut(false);
    }
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

      <PopupMessage
        visible={showConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        type="info"
        confirmText="Logout"
        onClose={confirmLogout}
        secondaryAction={{
          text: "Cancel",
          onPress: () => setShowConfirm(false),
        }}
      />

      <PopupMessage
        visible={showError}
        title="Error"
        message="Failed to logout. Please try again."
        type="error"
        onClose={() => setShowError(false)}
      />
    </View>
  );
}
