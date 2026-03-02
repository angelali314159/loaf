import { router } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { Button, H1, H2 } from "../../components/typography";

export default function Stats() {
  const navigateToPage = (page: string) => {
    router.push(`/(tabs)/${page}` as any);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-start pt-16 px-6">
        <H1 baseSize={28} className="text-center mb-2">
          Navigation Hub
        </H1>
        <H2 baseSize={14} className="text-center mb-8 text-gray-600">
          Navigate to any page in the app
        </H2>

        {/* Main App Pages */}
        <View className="w-full mb-6">
          <H2 baseSize={16} className="mb-4 font-semibold">
            Main Pages
          </H2>

          <Button
            title="Home / Landing Main"
            onPress={() => navigateToPage("landingMain")}
            color="yellow"
            fontColor="blue"
          />

          <Button
            title="Profile"
            onPress={() => navigateToPage("profile")}
            color="blue"
            fontColor="white"
          />

          <Button
            title="Index (Root)"
            onPress={() => navigateToPage("index")}
            color="yellow"
            fontColor="blue"
          />
        </View>

        {/* Authentication Pages */}
        <View className="w-full mb-6">
          <H2 baseSize={16} className="mb-4 font-semibold">
            Authentication
          </H2>

          <Button
            title="Login"
            onPress={() => navigateToPage("login")}
            color="blue"
            fontColor="white"
          />

          <Button
            title="Sign Up"
            onPress={() => navigateToPage("signUp")}
            color="yellow"
            fontColor="blue"
          />

          <Button
            title="Welcome"
            onPress={() => navigateToPage("welcome")}
            color="blue"
            fontColor="white"
          />
        </View>

        {/* Workout Pages */}
        <View className="w-full mb-6">
          <H2 baseSize={16} className="mb-4 font-semibold">
            Workout Management
          </H2>

          <Button
            title="Workout List"
            onPress={() => navigateToPage("workoutList")}
            color="yellow"
            fontColor="blue"
          />

          <Button
            title="In Workout"
            onPress={() => navigateToPage("inWorkout")}
            color="yellow"
            fontColor="blue"
          />

          <Button
            title="Workout Complete"
            onPress={() => navigateToPage("workoutComplete")}
            color="blue"
            fontColor="white"
          />

          <Button
            title="Post Workout"
            onPress={() => navigateToPage("postWorkout")}
            color="yellow"
            fontColor="blue"
          />
        </View>

        {/* Exercise Pages */}
        <View className="w-full mb-6">
          <H2 baseSize={16} className="mb-4 font-semibold">
            Exercises
          </H2>

          <Button
            title="All Exercises"
            onPress={() => navigateToPage("allExercises")}
            color="blue"
            fontColor="white"
          />

          <Button
            title="Exercise Preview"
            onPress={() => navigateToPage("exercisePreview")}
            color="yellow"
            fontColor="blue"
          />
        </View>

        {/* Add some bottom padding for better scrolling */}
        <View style={{ height: 100 }} />
      </View>
    </ScrollView>
  );
}
