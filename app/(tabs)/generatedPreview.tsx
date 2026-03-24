/*
OVERVIEW: This page appears after the user generates a workout through generateWorkout.tsx.
It also does the actual backend for creating the generated workout based on the user's selected criteria and the exercise library.
*/

import Gradient from "@/components/ui/Gradient";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Button, H2, P } from "../../components/typography";
import BackArrow from "../../components/ui/BackArrow";
import PopupMessage from "../../components/ui/PopupMessage";
import {
  ExerciseLibraryProvider,
  useExerciseLibrary,
} from "../../contexts/ExerciseLibraryContext";
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

function GeneratedPreviewContent() {
  const route = useRoute();
  const router = useRouter();
  const { height } = Dimensions.get("window");
  const { exercises, loading: libraryLoading } = useExerciseLibrary();

  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNoExercisesPopup, setShowNoExercisesPopup] = useState(false);

  useEffect(() => {
    if (route.params && !libraryLoading) {
      const params = route.params as {
        duration: number;
        selectedGroups: string[];
        selectedEquipments: string[];
      };
      generateWorkout(
        params.duration,
        params.selectedGroups,
        params.selectedEquipments,
      );
    }
  }, [route.params, libraryLoading]);

  const generateWorkout = (
    duration: number,
    selectedGroups: string[],
    selectedEquipments: string[],
  ) => {
    const maxExercises = Math.floor(duration / 10);

    // Filter exercises based on equipment and muscle groups
    const filteredExercises = exercises.filter((exercise) => {
      const hasEquipment =
        selectedEquipments.length === 0 ||
        selectedEquipments.includes(exercise.equipment || "");

      const hasMuscle = exercise.muscles.some((m) =>
        selectedGroups.includes(m.name),
      );

      return hasEquipment && hasMuscle;
    });

    if (filteredExercises.length === 0) {
      setShowNoExercisesPopup(true);
      return;
    }

    const workoutExercises: WorkoutExercise[] = [];
    const usedExerciseIds = new Set<number>();
    let muscleGroupIndex = 0;

    for (let i = 0; i < maxExercises; i++) {
      // Filter exercises by current muscle group if multiple groups selected
      let exercisesToChooseFrom = filteredExercises.filter(
        (ex) => !usedExerciseIds.has(ex.exercise_lib_id),
      );

      if (selectedGroups.length > 1) {
        const currentMuscleGroup = selectedGroups[muscleGroupIndex];

        exercisesToChooseFrom = exercisesToChooseFrom.filter((exercise) =>
          exercise.muscles.some((m) => m.name === currentMuscleGroup),
        );

        // If no exercises for this muscle group, use all unused filtered exercises
        if (exercisesToChooseFrom.length === 0) {
          exercisesToChooseFrom = filteredExercises.filter(
            (ex) => !usedExerciseIds.has(ex.exercise_lib_id),
          );
        }

        muscleGroupIndex = (muscleGroupIndex + 1) % selectedGroups.length;
      }

      // If we've used all available exercises, break
      if (exercisesToChooseFrom.length === 0) {
        break;
      }

      // Randomize exercise selection
      const randomIndex = Math.floor(
        Math.random() * exercisesToChooseFrom.length,
      );
      const selectedExercise = exercisesToChooseFrom[randomIndex];

      usedExerciseIds.add(selectedExercise.exercise_lib_id);
      workoutExercises.push({
        exercise_lib_id: selectedExercise.exercise_lib_id,
        name: selectedExercise.name,
        sets: 3,
        equipment: selectedExercise.equipment,
      });
    }

    setWorkout({
      duration,
      muscleGroups: selectedGroups,
      equipment: selectedEquipments,
      exercises: workoutExercises,
    });
  };

  const handleStartWorkout = () => {
    setLoading(true);

    // Format exercises to match workoutList.tsx format exactly
    const formattedExercises = (workout.exercises || []).map(
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
          workoutId: "generated",
          workoutName: "Generated Workout",
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

  if (libraryLoading) {
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
      <BackArrow page="/generateWorkout" />

      <ScrollView className="flex-1">
        <View className="gap-6">
          {workout && workout.exercises.length > 0 ? (
            <>
              <View className="gap-2">
                <H2 style={{ fontFamily: "Inter_SemiBold" }}>
                  Your Generated Workout
                </H2>

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

      <PopupMessage
        visible={showNoExercisesPopup}
        title="No exercises found"
        message="No exercises were found using that filter. Please adjust your selections and try again."
        type="error"
        onClose={() => {
          setShowNoExercisesPopup(false);
          router.push("/generateWorkout");
        }}
      />
    </View>
  );
}

export default function GeneratedPreview() {
  return (
    <ExerciseLibraryProvider>
      <GeneratedPreviewContent />
    </ExerciseLibraryProvider>
  );
}
