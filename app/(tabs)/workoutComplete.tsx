import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Button, H1 } from "../../components/typography";

export default function WorkoutComplete() {
  const params = useLocalSearchParams();
  const workoutData = params.workoutData as string;

  const handleShareWorkout = () => {
    router.push({
      pathname: "/(tabs)/postWorkout",
      params: { workoutData },
    });
  };

  return (
    <View>
      <H1>Workout Complete</H1>
      <Button title="Share Workout" onPress={handleShareWorkout} />
      <Button
        title="Go to Home"
        onPress={() => router.push("/(tabs)/landingMain")}
      />
    </View>
  );
}
