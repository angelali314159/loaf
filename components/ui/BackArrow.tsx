/*
OVERVIEW: A back arrow component for navigating back in the app.
You can specify a page to navigate to instead of going back, if desired.
 */
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

interface BackArrowProps {
  page?: string;
}

export default function BackArrow({ page }: BackArrowProps) {
  const handlePress = () => {
    if (page) {
      router.push(page as never);
      return;
    }

    router.back();
  };

  return (
    <TouchableOpacity onPress={handlePress} className="pr-3 py-2">
      <Feather name="chevron-left" size={26} color="#32393d" />
    </TouchableOpacity>
  );
}
