/*
OVERVIEW: This page appears when a workout is pressed to give the user a preview of the workout before they start.
*/

import Gradient from "@/components/ui/Gradient";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    Text,
    View,
} from "react-native";
import { Button, H2, P } from "../../components/typography";
import BackArrow from "../../components/ui/BackArrow";
import "../../global.css";

export interface WorkoutExercise {
  exercise_lib_id: number;
  name: string;
  sets: number;
  reps?: number;
  equipment?: string | null;
}

export interface GeneratedWorkout {
  duration: number;
  muscleGroups: string[];
  equipment: string[];
  exercises: WorkoutExercise[];
}

export default function WorkoutPreviewContent() {
  const route = useRoute();
  const router = useRouter();
  const { height } = Dimensions.get("window");

  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [workoutName, setWorkoutName] = useState<string>("Workout Preview");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (route.params?.exercises) {
      const exercises = JSON.parse(route.params.exercises);
      setWorkout({
        duration: route.params.duration || exercises.length * 10,
        muscleGroups: [],
        equipment: [],
        exercises: exercises,
      });
    }

    if (route.params?.workoutName) {
      setWorkoutName(route.params.workoutName);
    }
  }, [route.params]);

  const handleStartWorkout = () => {
    setLoading(true);

    // Format exercises to match workoutList.tsx format exactly
    const formattedExercises = (workout?.exercises || []).map(
      (ex: any, index: number) => ({
        exercise_lib_id: ex.exercise_lib_id,
        name: ex.name,
        exercise_order: index + 1,
      }),
    );

    try {
      router.push({
        pathname: "/inWorkout",
        params: {
          sessionId: Date.now().toString(),
          workoutId: "preview-" + workoutName.replace(/\s+/g, "-"),
          workoutName: workoutName,
          exercises: JSON.stringify(formattedExercises),
          isSavedWorkout: "false",
        },
      });
    } catch (error) {
      console.error("Error navigating to inWorkout:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!workout) {
    return (
      <View className="flex-1 bg-[#f2f0ef] justify-center items-center">
        <ActivityIndicator size="large" color="#ffd60a" />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-[#f2f0ef] pt-20 gap-4"
      style={{ paddingBottom: height * 0.1, paddingHorizontal: 20 }}
    >
      <Gradient />
      <BackArrow />

      <ScrollView className="flex-1">
        <View className="gap-6">
          {workout && workout.exercises.length > 0 ? (
            <>
              <View className="gap-2">
                <H2 style={{ fontFamily: "Inter_SemiBold" }}>{workoutName}</H2>

                <View className="mt-6 flex-row items-center justify-between w-full">
                  <View className="flex-1 items-center">
                    <Text style={{ fontSize: 12, color: "#32393d" }}>
                      Duration
                    </Text>
                    <Text
                      style={{ fontSize: 16, color: "#32393d", marginTop: 8 }}
                    >
                      {workout.exercises.length * 10} min
                    </Text>
                  </View>

                  <View className="h-12 w-[1px] bg-[#B9B9B9] opacity-80" />

                  <View className="flex-1 items-center">
                    <Text style={{ fontSize: 12, color: "#32393d" }}>
                      Total Exercises
                    </Text>
                    <Text
                      style={{ fontSize: 16, color: "#32393d", marginTop: 8 }}
                    >
                      {workout.exercises.length}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="gap-3">
                {workout.exercises.map((exercise, index) => (
                  <View
                    key={index}
                    className="bg-white rounded-lg p-4 border-l-4 border-yellow-400"
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <P
                          style={{ fontFamily: "Inter_SemiBold" }}
                          className="text-lg"
                        >
                          {exercise.name}
                        </P>
                        {exercise.equipment && (
                          <P className="text-gray-500 text-sm mt-1">
                            Equipment: {exercise.equipment}
                          </P>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View className="items-center justify-center py-10"></View>
          )}
        </View>
      </ScrollView>

      {workout && workout.exercises.length > 0 && (
        <View className="flex-row justify-between gap-4 w-full">
          <Button
            className="flex-1"
            title="Cancel"
            onPress={() => router.back()}
            color="black"
            fontColor="white"
            fontSize={14}
          />
          <Button
            className="flex-1"
            title={loading ? "Starting..." : "Start Workout"}
            onPress={handleStartWorkout}
            color="yellow"
            fontColor="black"
            fontSize={14}
            disabled={loading}
          />
        </View>
      )}
    </View>
  );
}
