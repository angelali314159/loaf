import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import WorkoutPreview from "../../components/WorkoutPreview";
import { H1, H2, P } from "../../components/typography";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabase";

interface WorkoutPlan {
  workout_id: number;
  workout_name: string;
  exercises: {
    exercise_lib_id: number;
    name: string;
    exercise_order: number;
  }[];
}

export default function WorkoutList() {
  const { user } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(
    null,
  );

  const fetchWorkouts = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch workouts for the user
      const { data: workouts, error: workoutsError } = await supabase
        .from("workouts")
        .select("workout_id, workout_name, created_at")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });

      if (workoutsError) {
        console.error("Error fetching workouts:", workoutsError);
        throw workoutsError;
      }

      console.log("Fetched workouts:", JSON.stringify(workouts, null, 2));

      // Fetch workout details using RPC function for each workout
      const formattedWorkouts: WorkoutPlan[] = await Promise.all(
        (workouts || []).map(async (workout) => {
          const { data, error } = await supabase.rpc("get_workout_preview", {
            p_workout_id: workout.workout_id,
          });

          if (error) {
            console.error(
              `Error fetching workout preview for ${workout.workout_id}:`,
              error,
            );
            return {
              workout_id: workout.workout_id,
              workout_name: workout.workout_name,
              exercises: [],
            };
          }

          console.log(
            `Workout preview for ${workout.workout_id}:`,
            JSON.stringify(data, null, 2),
          );

          return {
            workout_id: data.workout_id,
            workout_name: data.workout_name,
            exercises: (data.exercises || []).map((ex: any) => ({
              exercise_lib_id: ex.exercise_id,
              name: ex.name,
              exercise_order: ex.order,
            })),
          };
        }),
      );

      console.log(
        "Final formatted workouts:",
        JSON.stringify(formattedWorkouts, null, 2),
      );
      setWorkoutPlans(formattedWorkouts);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [user]);

  const navigateToWorkout = (workoutPlan: WorkoutPlan) => {
    router.push({
      pathname: "/(tabs)/inWorkout",
      params: {
        workoutId: workoutPlan.workout_id.toString(),
        workoutName: workoutPlan.workout_name,
        exercises: JSON.stringify(workoutPlan.exercises),
      },
    });
  };

  const startEmptyWorkout = () => {
    router.push({
      pathname: "/(tabs)/inWorkout",
      params: { workoutId: "new" },
    });
  };

  const handlePreviewWorkout = (workoutPlan: WorkoutPlan) => {
    setSelectedWorkout(workoutPlan);
  };

  const handleClosePreview = () => {
    setSelectedWorkout(null);
  };

  const handleStartFromPreview = (workoutPlan: WorkoutPlan) => {
    setSelectedWorkout(null);
    navigateToWorkout(workoutPlan);
  };

  return (
    <View className="flex-1 bg-[#f2f0ef]">
      <ScrollView className="flex-1 mx-4">
        {/* Header */}
        <View className="mt-10 mb-6">
          <View className="flex-row justify-between items-center">
            <H1 className="text-[#32393d] text-4xl">My Workouts</H1>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="p-2"
                onPress={() => router.push("/(tabs)/createWorkout")}
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
          <P className="text-[#32393d] text-lg mt-2">
            {workoutPlans.length} workout{workoutPlans.length !== 1 ? "s" : ""}{" "}
            saved
          </P>
        </View>

        {/* Workout List */}
        <View className="mb-8">
          {loading ? (
            <View className="items-center justify-center py-8">
              <P className="text-[#32393d]">Loading workouts...</P>
            </View>
          ) : (
            <>
              {/* Start Empty Workout Card */}
              <TouchableOpacity className="mb-4" onPress={startEmptyWorkout}>
                <LinearGradient
                  colors={["#FCDE8C", "#fef3d4"]}
                  locations={[0, 0.8]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  className="rounded-lg p-4"
                >
                  <View className="flex-row items-center justify-center py-2">
                    <Feather name="plus-circle" size={24} color="#32393d" />
                    <H2 className="text-[#32393d] text-xl ml-3">
                      Start Empty Workout
                    </H2>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Existing Workouts */}
              {workoutPlans.length === 0 ? (
                <LinearGradient
                  colors={["#FFD3D3", "#ffeded"]}
                  locations={[0, 0.8]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  className="rounded-lg p-8 items-center justify-center"
                >
                  <P className="text-[#32393d] text-center text-lg">
                    No saved workouts yet.{"\n"}Create your first workout plan!
                  </P>
                </LinearGradient>
              ) : (
                workoutPlans.map((item, index) => (
                  <View key={item.workout_id} className="mb-4">
                    <TouchableOpacity
                      onPress={() => handlePreviewWorkout(item)}
                    >
                      <LinearGradient
                        colors={
                          index % 3 === 0
                            ? ["#FFD3D3", "#ffeded"]
                            : index % 3 === 1
                              ? ["#E1D8FC", "#f0ebff"]
                              : ["#DDF8FE", "#ebf9fd"]
                        }
                        locations={[0, 0.8]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        className="rounded-lg p-4"
                      >
                        <View className="flex-row justify-between items-center">
                          <View className="flex-1">
                            <H2 className="text-[#32393d] text-xl mb-3">
                              {item.workout_name}
                            </H2>
                            <View className="flex-row flex-wrap">
                              {item.exercises.map((exercise) => (
                                <View
                                  key={exercise.exercise_lib_id}
                                  className="bg-white/80 rounded-lg px-3 py-1 mr-2 mb-2 border border-[#32393d]"
                                >
                                  <P className="text-[#32393d] text-sm font-semibold">
                                    {exercise.name}
                                  </P>
                                </View>
                              ))}
                            </View>
                            <P className="text-[#32393d] text-sm mt-2 opacity-70">
                              {item.exercises.length} exercise
                              {item.exercises.length !== 1 ? "s" : ""}
                            </P>
                          </View>
                        </View>
                        {/* Start Button */}
                        <TouchableOpacity
                          className="mt-3 rounded-lg py-3 items-center"
                          onPress={() => navigateToWorkout(item)}
                        >
                          <P className="text-white font-bold">Start Workout</P>
                        </TouchableOpacity>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Workout Preview Modal */}
      {selectedWorkout && (
        <WorkoutPreview
          workout={selectedWorkout}
          onClose={handleClosePreview}
          onStart={handleStartFromPreview}
        />
      )}
    </View>
  );
}
