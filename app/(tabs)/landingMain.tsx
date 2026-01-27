import React from "react";
import { ScrollView, View } from "react-native";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { H1, P } from "../../components/typography";
import { useAuth } from "../../contexts/AuthContext";

export default function LandingMain() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <View className="flex-1 bg-[#f2f0ef]">
        <ScrollView className="flex-1 mx-4">
          {/* Header */}
          <View className="mt-10 mb-4">
            <H1 className="text-[#32393d] text-4xl">Hello {user?.username}!</H1>
            <P className="text-[#32393d] text-lg mt-2">
              Ready for your workout today?
            </P>
          </View>
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
}
