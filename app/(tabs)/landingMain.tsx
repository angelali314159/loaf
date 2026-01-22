import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { H1, H2, P } from "../../components/typography";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabase";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  type: string[];
  time?: number;
}

interface WorkoutPlan {
  workout_id: number;
  workout_name: string;
  exercises: {
    exercise_lib_id: number;
    name: string;
    exercise_order: number;
  }[];
}

export default function LandingMain() {
  const { user } = useAuth();
  const [savedExercises, setSavedExercises] = useState<WorkoutPlan[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);

  const fetchWorkouts = async () => {
    if (!user?.id) return;

    try {
      // Fetch workouts for the user
      const { data: workouts, error: workoutsError } = await supabase
        .from("workouts")
        .select(
          `
          workout_id,
          workout_name,
          workout_exercises (
            exercise_lib_id,
            exercise_order,
            exercise_library (
              name
            )
          )
        `,
        )
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });

      if (workoutsError) throw workoutsError;

      // Transform the data to match our WorkoutPlan interface
      const formattedWorkouts: WorkoutPlan[] = (workouts || []).map(
        (workout) => ({
          workout_id: workout.workout_id,
          workout_name: workout.workout_name,
          exercises: (workout.workout_exercises || [])
            .sort((a, b) => a.exercise_order - b.exercise_order)
            .map((we) => ({
              exercise_lib_id: we.exercise_lib_id,
              name: we.exercise_library.name,
              exercise_order: we.exercise_order,
            })),
        }),
      );

      setSavedExercises(formattedWorkouts);
      setWorkoutPlans(formattedWorkouts);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [user]);

  const navigateToExercises = (exerciseType: string) => {
    router.push({
      pathname: "/(tabs)/exercisePreview",
      params: { exerciseType },
    });
  };

  const navigateToWorkout = (workoutPlan: WorkoutPlan) => {
    router.push({
      pathname: "/(tabs)/inWorkout",
      params: { workoutId: workoutPlan.workout_id.toString() },
    });
  };

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

          {/* Workouts Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <H2 className="text-[#32393d] text-2xl">Workouts</H2>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="p-2"
                  //onPress={() => router.push('/(tabs)/addWorkout')}
                >
                  <Feather name="plus" size={27} color="#32393d" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="p-2"
                  //onPress={() => router.push('/(tabs)/generateWorkout')}
                >
                  <Ionicons name="sparkles" size={23} color="#32393d" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Saved Workouts */}
            <LinearGradient
              colors={["#FFD3D3", "#ffeded"]}
              locations={[0, 0.8]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              className="rounded-lg p-4 min-h-[200px]"
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                {savedExercises.length === 0 ? (
                  <View className="items-center justify-center py-8">
                    <P className="text-[#32393d] text-center">
                      No workouts yet. Create your first workout!
                    </P>
                  </View>
                ) : (
                  savedExercises.map((item) => (
                    <TouchableOpacity
                      key={item.workout_id}
                      className="bg-white/90 rounded-lg p-4 mb-3 flex-row justify-between items-center"
                      onPress={() => navigateToWorkout(item)}
                    >
                      <View className="flex-1">
                        <P className="text-[#32393d] font-bold text-lg mb-2">
                          {item.workout_name}
                        </P>
                        <View className="flex-row flex-wrap">
                          {item.exercises.slice(0, 3).map((exercise) => (
                            <View
                              key={exercise.exercise_lib_id}
                              className="bg-[#FFD3D3] rounded-lg px-3 py-1 mr-2 mb-1 border border-[#32393d]"
                            >
                              <P className="text-[#32393d] text-sm font-bold">
                                {exercise.name}
                              </P>
                            </View>
                          ))}
                          {item.exercises.length > 3 && (
                            <P className="text-[#32393d] text-sm">...</P>
                          )}
                        </View>
                      </View>
                      <Feather name="chevron-right" size={24} color="#32393d" />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </LinearGradient>
          </View>

          {/* Explore Workouts Section */}
          <View className="mb-8">
            <H2 className="text-[#32393d] text-2xl mb-4">
              Explore some workouts
            </H2>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-4">
                {/* Abs */}
                <TouchableOpacity
                  className="w-32 h-48 rounded-lg overflow-hidden"
                  onPress={() => navigateToExercises("Abs")}
                >
                  <LinearGradient
                    colors={["#E1D8FC", "#C4B2FA"]}
                    locations={[0.18, 0.7]}
                    start={{ x: 0, y: 0 }}
                    className="flex-1 justify-between p-3"
                  >
                    <P className="text-[#32393d] font-bold text-center">Abs</P>
                    <Image
                      source={require("../../assets/images/cat-grey.png")}
                      className="w-20 h-32 self-center"
                      style={{ resizeMode: "contain" }}
                    />
                  </LinearGradient>
                </TouchableOpacity>

                {/* Back */}
                <TouchableOpacity
                  className="w-32 h-48 rounded-lg overflow-hidden"
                  onPress={() => navigateToExercises("Back")}
                >
                  <LinearGradient
                    colors={["#DDF8FE", "#B3EEFB"]}
                    locations={[0.18, 0.7]}
                    start={{ x: 0, y: 0 }}
                    className="flex-1 justify-between p-3"
                  >
                    <P className="text-[#32393d] font-bold text-center">Back</P>
                    <Image
                      source={require("../../assets/images/cat-scared.png")}
                      className="w-20 h-32 self-center"
                      style={{ resizeMode: "contain" }}
                    />
                  </LinearGradient>
                </TouchableOpacity>

                {/* Biceps */}
                <TouchableOpacity
                  className="w-32 h-48 rounded-lg overflow-hidden"
                  onPress={() => navigateToExercises("Biceps")}
                >
                  <LinearGradient
                    colors={["#e5c5e6", "#d692d8"]}
                    locations={[0.18, 0.7]}
                    start={{ x: 0, y: 0 }}
                    className="flex-1 justify-between p-3"
                  >
                    <P className="text-[#32393d] font-bold text-center">
                      Biceps
                    </P>
                    <Image
                      source={require("../../assets/images/cat-orange.png")}
                      className="w-20 h-32 self-center"
                      style={{ resizeMode: "contain" }}
                    />
                  </LinearGradient>
                </TouchableOpacity>

                {/* Calves */}
                <TouchableOpacity
                  className="w-32 h-48 rounded-lg overflow-hidden"
                  onPress={() => navigateToExercises("Calves")}
                >
                  <LinearGradient
                    colors={["#c3d0df", "#85a8ce"]}
                    locations={[0.18, 0.8]}
                    start={{ x: 0, y: 0 }}
                    className="flex-1 justify-between p-3"
                  >
                    <P className="text-[#32393d] font-bold text-center">
                      Calves
                    </P>
                    <Image
                      source={require("../../assets/images/cat-back.png")}
                      className="w-24 h-32 self-center"
                      style={{ resizeMode: "contain" }}
                    />
                  </LinearGradient>
                </TouchableOpacity>

                {/* Chest */}
                <TouchableOpacity
                  className="w-32 h-48 rounded-lg overflow-hidden"
                  onPress={() => navigateToExercises("Chest")}
                >
                  <LinearGradient
                    colors={["#f3e2ef", "#f8b8ec"]}
                    locations={[0.18, 0.8]}
                    start={{ x: 0, y: 0 }}
                    className="flex-1 justify-between p-3"
                  >
                    <P className="text-[#32393d] font-bold text-center">
                      Chest
                    </P>
                    <Image
                      source={require("../../assets/images/cat-fur.png")}
                      className="w-28 h-32 self-center"
                      style={{ resizeMode: "contain" }}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
}
