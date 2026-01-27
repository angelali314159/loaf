import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import ExerciseList from "../../components/ExerciseList";
import PopupMessage from "../../components/PopupMessage";
import { Button, H1, H2, P } from "../../components/typography";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabase";

interface Exercise {
  exercise_lib_id: number;
  name: string;
  category: string | null;
  equipment: string | null;
}

export default function CreateWorkout() {
  const { user } = useAuth();
  const [workoutName, setWorkoutName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [saving, setSaving] = useState(false);

  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "success" | "info",
    onClose: () => {},
  });

  const handleAddExercises = () => {
    setShowExerciseList(true);
  };

  const handleSelectExercise = (exercise: Exercise) => {
    // Check if exercise is already selected
    const isSelected = selectedExercises.some(
      (ex) => ex.exercise_lib_id === exercise.exercise_lib_id,
    );

    if (isSelected) {
      // Remove if already selected
      setSelectedExercises((prev) =>
        prev.filter((ex) => ex.exercise_lib_id !== exercise.exercise_lib_id),
      );
    } else {
      // Add if not selected
      setSelectedExercises((prev) => [...prev, exercise]);
    }
  };

  const handleRemoveExercise = (exerciseId: number) => {
    setSelectedExercises((prev) =>
      prev.filter((ex) => ex.exercise_lib_id !== exerciseId),
    );
  };

  const moveExercise = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === selectedExercises.length - 1)
    ) {
      return;
    }

    const newExercises = [...selectedExercises];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newExercises[index], newExercises[targetIndex]] = [
      newExercises[targetIndex],
      newExercises[index],
    ];
    setSelectedExercises(newExercises);
  };

  const handleSaveWorkout = async () => {
    // Validation
    if (!workoutName.trim()) {
      setPopupConfig({
        title: "Missing Information",
        message: "Please enter a workout name",
        type: "error",
        onClose: () => setShowPopup(false),
      });
      setShowPopup(true);
      return;
    }

    if (selectedExercises.length === 0) {
      setPopupConfig({
        title: "Missing Exercises",
        message: "Please add at least one exercise",
        type: "error",
        onClose: () => setShowPopup(false),
      });
      setShowPopup(true);
      return;
    }

    if (!user?.id) {
      setPopupConfig({
        title: "Authentication Error",
        message: "User not authenticated",
        type: "error",
        onClose: () => setShowPopup(false),
      });
      setShowPopup(true);
      return;
    }

    try {
      setSaving(true);

      // Insert workout
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          profile_id: user.id,
          workout_name: workoutName.trim(),
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Insert workout exercises
      const workoutExercises = selectedExercises.map((exercise, index) => ({
        workout_id: workout.workout_id,
        exercise_lib_id: exercise.exercise_lib_id,
        exercise_order: index + 1,
      }));

      const { error: exercisesError } = await supabase
        .from("workout_exercises")
        .insert(workoutExercises);

      if (exercisesError) throw exercisesError;

      setPopupConfig({
        title: "Success",
        message: "Workout saved successfully!",
        type: "success",
        onClose: () => {
          setShowPopup(false);
          router.push("/(tabs)/workoutList");
        },
      });
      setShowPopup(true);
    } catch (error) {
      console.error("Error saving workout:", error);
      setPopupConfig({
        title: "Error",
        message: "Failed to save workout. Please try again.",
        type: "error",
        onClose: () => setShowPopup(false),
      });
      setShowPopup(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-[#f2f0ef]">
      <ScrollView className="flex-1 mx-4">
        {/* Header */}
        <View className="mt-10 mb-6">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 p-2"
            >
              <Feather name="arrow-left" size={24} color="#32393d" />
            </TouchableOpacity>
            <H1 className="text-[#32393d] text-4xl">Create Workout</H1>
          </View>
        </View>

        {/* Workout Name Input */}
        <View className="mb-6">
          <H2 className="text-[#32393d] text-xl mb-3">Workout Name</H2>
          <TextInput
            className="bg-white rounded-lg px-4 py-3 text-[#32393d] border border-[#32393d]/20"
            placeholder="e.g., Upper Body Day"
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholderTextColor="#999"
          />
        </View>

        {/* Exercises Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <H2 className="text-[#32393d] text-xl">
              Exercises ({selectedExercises.length})
            </H2>
            <TouchableOpacity
              className="flex-row items-center bg-[#FCDE8C] rounded-lg px-4 py-2"
              onPress={handleAddExercises}
            >
              <Feather name="plus" size={20} color="#32393d" />
              <P className="ml-2 text-[#32393d] font-bold">Add Exercises</P>
            </TouchableOpacity>
          </View>

          {selectedExercises.length === 0 ? (
            <LinearGradient
              colors={["#DDF8FE", "#ebf9fd"]}
              locations={[0, 0.8]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              className="rounded-lg p-8 items-center justify-center"
            >
              <P className="text-[#32393d] text-center text-lg">
                No exercises added yet.{"\n"}Tap "Add Exercises" to get started!
              </P>
            </LinearGradient>
          ) : (
            selectedExercises.map((exercise, index) => (
              <View
                key={exercise.exercise_lib_id}
                className="bg-white rounded-lg p-4 mb-3 border border-[#32393d]/20"
              >
                <View className="flex-row items-center">
                  {/* Order Number */}
                  <View className="w-8 h-8 rounded-full bg-[#32393d] items-center justify-center mr-3">
                    <P className="text-white font-bold">{index + 1}</P>
                  </View>

                  {/* Exercise Info */}
                  <View className="flex-1">
                    <P className="text-[#32393d] font-bold text-lg mb-1">
                      {exercise.name}
                    </P>
                    <View className="flex-row flex-wrap gap-2">
                      {exercise.equipment && (
                        <View className="bg-[#DDF8FE] rounded px-2 py-1">
                          <P className="text-[#32393d] text-xs">
                            {exercise.equipment}
                          </P>
                        </View>
                      )}
                      {exercise.category && (
                        <View className="bg-[#FFD3D3] rounded px-2 py-1">
                          <P className="text-[#32393d] text-xs">
                            {exercise.category}
                          </P>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Reorder Buttons */}
                  <View className="flex-col gap-1 mr-2">
                    <TouchableOpacity
                      onPress={() => moveExercise(index, "up")}
                      disabled={index === 0}
                    >
                      <Feather
                        name="chevron-up"
                        size={20}
                        color={index === 0 ? "#ccc" : "#32393d"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => moveExercise(index, "down")}
                      disabled={index === selectedExercises.length - 1}
                    >
                      <Feather
                        name="chevron-down"
                        size={20}
                        color={
                          index === selectedExercises.length - 1
                            ? "#ccc"
                            : "#32393d"
                        }
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Remove Button */}
                  <TouchableOpacity
                    onPress={() =>
                      handleRemoveExercise(exercise.exercise_lib_id)
                    }
                  >
                    <Feather name="x-circle" size={24} color="#DD6C6A" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Save Button */}
        <View className="mb-8">
          <Button
            title={saving ? "Saving..." : "Save Workout"}
            onPress={handleSaveWorkout}
            color="blue"
            fontColor="yellow"
            disabled={saving}
          />
        </View>
      </ScrollView>

      {/* Exercise List Modal */}
      <ExerciseList
        visible={showExerciseList}
        onClose={() => setShowExerciseList(false)}
        onSelectExercise={handleSelectExercise}
        selectedExercises={selectedExercises}
      />

      {/* Popup Message */}
      <PopupMessage
        visible={showPopup}
        title={popupConfig.title}
        message={popupConfig.message}
        type={popupConfig.type}
        onClose={popupConfig.onClose}
      />
    </View>
  );
}
