import { router } from "expo-router";
import React, { useState } from "react";
import {Dimensions, ScrollView, View} from "react-native";
import PopupMessage from "../../components/PopupMessage";
import { Button, H3 } from "../../components/typography";
import { useAuth } from "../../contexts/AuthContext";
import Svg, {Defs, RadialGradient, Rect, Stop} from "react-native-svg";

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
        {/* SEMICIRCLE GRADIENT BACKGROUND */}
      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 0 }}
      >
        <Svg
          height={Dimensions.get("screen").height * 0.5}
          width={Dimensions.get("screen").width}
        >
          <Defs>
            <RadialGradient
              id="topSemiCircle"
              cx="50%" //centered horizontally
              cy="0%" //top edge
              rx="150%" //horiztonal radius
              ry="70%" //vertical radius
              gradientUnits="objectBoundingBox"
            >
              <Stop offset="0%" stopColor="#FCDE8C" stopOpacity={0.9} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.1} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#topSemiCircle)" />
        </Svg>
      </View>

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
