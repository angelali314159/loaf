import Gradient from "@/components/ui/Gradient";
import { useAuth } from "@/contexts/AuthContext";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  View
} from "react-native";
import { Button, H2, P } from "../../components/typography";
import BackArrow from "../../components/ui/BackArrow";
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
  const { user } = useAuth();

  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Route params:", route.params);
    if (route.params && !libraryLoading) {
      const params = route.params as {
        duration: number;
        selectedGroups: string[];
        selectedEquipments: string[];
      };
      console.log("Generating workout with params:", params);
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
    console.log("generateWorkout called with:", {
      duration,
      selectedGroups,
      selectedEquipments,
    });

    if (duration === 0 || selectedGroups.length === 0) {
      console.log("Duration or groups empty, setting empty workout");
      setWorkout({
        duration,
        muscleGroups: selectedGroups,
        equipment: selectedEquipments,
        exercises: [],
      });
      return;
    }

    const maxExercises = Math.floor(duration / 10);
    console.log("Max exercises for duration:", maxExercises);

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

    console.log("Filtered exercises count:", filteredExercises.length);
    console.log("Filtered exercises:", filteredExercises);

    if (filteredExercises.length === 0) {
      console.log("No filtered exercises found");
      setWorkout({
        duration,
        muscleGroups: selectedGroups,
        equipment: selectedEquipments,
        exercises: [],
      });
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
        console.log(
          `Set ${i + 1}: choosing from muscle group: ${currentMuscleGroup}`,
        );
        exercisesToChooseFrom = exercisesToChooseFrom.filter((exercise) =>
          exercise.muscles.some((m) => m.name === currentMuscleGroup),
        );

        // If no exercises for this muscle group, use all unused filtered exercises
        if (exercisesToChooseFrom.length === 0) {
          console.log(
            `No exercises for ${currentMuscleGroup}, using all unused filtered`,
          );
          exercisesToChooseFrom = filteredExercises.filter(
            (ex) => !usedExerciseIds.has(ex.exercise_lib_id),
          );
        }

        muscleGroupIndex = (muscleGroupIndex + 1) % selectedGroups.length;
      }

      // If we've used all available exercises, break
      if (exercisesToChooseFrom.length === 0) {
        console.log("No more unique exercises available");
        break;
      }

      // Randomize exercise selection
      const randomIndex = Math.floor(
        Math.random() * exercisesToChooseFrom.length,
      );
      const selectedExercise = exercisesToChooseFrom[randomIndex];

      console.log(`Set ${i + 1}: Selected exercise:`, selectedExercise.name);

      usedExerciseIds.add(selectedExercise.exercise_lib_id);
      workoutExercises.push({
        exercise_lib_id: selectedExercise.exercise_lib_id,
        name: selectedExercise.name,
        sets: 3,
        equipment: selectedExercise.equipment,
      });
    }

    console.log("Final workout exercises:", workoutExercises);

    setWorkout({
      duration,
      muscleGroups: selectedGroups,
      equipment: selectedEquipments,
      exercises: workoutExercises,
    });
  };

  const handleStartWorkout = () => {
    console.log("handleStartWorkout called");
    console.log("Current workout state:", workout);

    if (!workout) {
      console.log("No workout to start");
      return;
    }

    if (workout.exercises.length === 0) {
      console.log("No exercises in workout");
      return;
    }

    setLoading(true);

    // Format exercises to match workoutList.tsx format exactly
    const formattedExercises = (workout.exercises || []).map(
      (ex: any, index: number) => ({
        exercise_lib_id: ex.exercise_lib_id,
        name: ex.name,
        exercise_order: index + 1,
      }),
    );

    console.log("Formatted exercises for inWorkout:", formattedExercises);

    try {
      router.push({
        pathname: "/(tabs)/inWorkout",
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
                <H2 style={{ fontFamily: "Inter_SemiBold" }}>Your Workout</H2>
                <P className="text-gray-600">
                  Duration: {workout.duration} minutes
                </P>
                <P className="text-gray-600">
                  Total Exercises: {workout.exercises.length}
                </P>
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
                          {index + 1}. {exercise.name}
                        </P>
                        {exercise.equipment && (
                          <P className="text-gray-500 text-sm mt-1">
                            Equipment: {exercise.equipment}
                          </P>
                        )}
                      </View>
                    </View>
                    <P className="text-gray-700 mt-2">
                      {exercise.sets} sets × 3 min per set
                    </P>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View className="items-center justify-center py-10">
              <P className="text-gray-600 text-center">
                No exercises found for the selected criteria. Try adjusting your
                filters.
              </P>
            </View>
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

export default function GeneratedPreview() {
  return (
    <ExerciseLibraryProvider>
      <GeneratedPreviewContent />
    </ExerciseLibraryProvider>
  );
}
