import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { Button, H1, H3, P } from "../../components/typography";

interface PRData {
  exercise_id: number;
  exercise_name: string;
  new_weight: number;
  previous_weight: number;
}

export default function WorkoutComplete() {
  const params = useLocalSearchParams();
  const workoutDataString = params.workoutData as string;

  let workoutData: any = {};
  let prs: PRData[] = [];

  try {
    workoutData = JSON.parse(workoutDataString);
    if (workoutData.prs) {
      prs = JSON.parse(workoutData.prs);
    }
  } catch (error) {
    console.error("Error parsing workout data:", error);
  }

  const handleShareWorkout = () => {
    router.push({
      pathname: "/(tabs)/postWorkout",
      params: { workoutData: workoutDataString },
    });
  };

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <H1 className="text-center mb-6">Workout Complete! 🎉</H1>

      {/* Workout Stats */}
      <View className="mb-6">
        <H3 className="mb-2">Workout Summary</H3>
        <P>Duration: {Math.floor(workoutData.duration / 60)} minutes</P>
        <P>Exercises: {workoutData.exercises}</P>
        <P>Sets: {workoutData.sets}</P>
        <P>Total Reps: {workoutData.totalReps}</P>
        <P>Weight Lifted: {workoutData.weightLifted} lbs</P>
      </View>

      {/* Personal Records */}
      {prs && prs.length > 0 && (
        <View className="mb-6 p-4 bg-yellow-100 rounded-lg">
          <H3 className="mb-3">🏆 New Personal Records!</H3>
          {prs.map((pr, index) => (
            <View key={index} className="mb-2">
              <P className="font-bold">{pr.exercise_name}</P>
              <P>
                New PR: {pr.new_weight} lbs
                {pr.previous_weight > 0 && (
                  <P className="text-gray-600">
                    {" "}
                    (Previous: {pr.previous_weight} lbs)
                  </P>
                )}
              </P>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View className="gap-4">
        <Button title="Share Workout" onPress={handleShareWorkout} />
        <Button
          title="Go to Home"
          onPress={() => router.push("/(tabs)/landingMain")}
        />
      </View>
    </ScrollView>
  );
}
