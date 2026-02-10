import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, TouchableOpacity, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import WorkoutPreview from "../../components/WorkoutPreview";
import { Button, H3, P } from "../../components/typography";
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

      // Fetch workouts from Supabase for the user
      const { data: workouts, error: workoutsError } = await supabase
        .from("workouts")
        .select("workout_id, workout_name, created_at")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });

      if (workoutsError) {
        console.error("Error fetching workouts:", workoutsError);
        throw workoutsError;
      }

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
      setWorkoutPlans(formattedWorkouts);
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

  const height = Dimensions.get("screen").height;
  const width = Dimensions.get("screen").width;

  return (
    <View className="flex-1 bg-white">
      {/* SEMICIRCLE GRADIENT BACKGROUND */}
      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 0 }}
      >
        <Svg
          height={Dimensions.get("screen").height * 0.5}
          width={Dimensions.get("screen").width}
        >
          <Defs>
            <RadialGradient
              id="topSemiCircle"
              cx="50%" //centered horizontally
              cy="0%" //top edge
              rx="150%" //horiztonal radius
              ry="70%" //vertical radius
              gradientUnits="objectBoundingBox"
            >
              <Stop offset="0%" stopColor="#FCDE8C" stopOpacity={0.9} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.1} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#topSemiCircle)" />
        </Svg>
      </View>

      {/* Static Header Section */}
      <View className="mx-8">
        {/* Dice and Plus buttons*/}
        <View className="flex-row justify-end mt-20">
          <TouchableOpacity
            className="p-2 mr-2"
            onPress={() => router.push("/(tabs)/generateWorkout")}
          >
            <Feather name="shuffle" size={height * 0.035} color="#32393d" />
          </TouchableOpacity>

          <TouchableOpacity
            className="p-2"
            onPress={() => router.push("/(tabs)/createWorkout")}
          >
            <Feather name="plus" size={height * 0.035} color="#32393d" />
          </TouchableOpacity>
        </View>

        <H3 className="mb-2" baseSize={14}>
          My Workouts
        </H3>
        <Button
          title="Start Empty Workout"
          onPress={startEmptyWorkout}
          fontSize={12}
          height={20}
          style={{ marginBottom: 20 }}
        />
      </View>

      {/* Scrollable Workout List */}
      <ScrollView
        className="flex-1 mx-8"
        contentContainerStyle={{ paddingBottom: height * 0.1 }}
      >
        <View className="mb-8">
          {loading ? (
            <View className="items-center justify-center py-8">
              <P className="text-black">Loading workouts...</P>
            </View>
          ) : (
            <>
              {/* Existing Workouts */}
              {workoutPlans.length === 0 ? (
                <P
                  className="text-[#32393d] text-center text-lg "
                  style={{ marginTop: height * 0.2 }}
                >
                  No saved workouts yet.{"\n"}Create your first workout plan by
                  pressing the + button.
                </P>
              ) : (
                workoutPlans.map((item) => (
                  <TouchableOpacity
                    key={item.workout_id}
                    onPress={() => handlePreviewWorkout(item)}
                    className="mt-2 mb-2 pb-4 border-b border-[#32393d]/20"
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 mr-4">
                        <P
                          className="text-[#32393d]"
                          style={{ fontWeight: "600" }}
                        >
                          {item.workout_name}
                        </P>
                        <P className="text-[#565656]">
                          {item.exercises
                            .slice(0, 2)
                            .map((ex) => ex.name)
                            .join(", ")}
                          {item.exercises.length > 2 &&
                            `, +${item.exercises.length - 2} more`}
                        </P>
                      </View>
                      <Button
                        title="Start"
                        width="18%"
                        fontSize={12}
                        height={8}
                        onPress={() => {
                          navigateToWorkout(item);
                        }}
                      />
                    </View>
                  </TouchableOpacity>
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
