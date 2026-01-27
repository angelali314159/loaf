import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { H2, H3, P } from "./typography";

interface Exercise {
  exercise_lib_id: number;
  name: string;
  exercise_order: number;
}

interface WorkoutPlan {
  workout_id: number;
  workout_name: string;
  exercises: Exercise[];
}

interface WorkoutPreviewProps {
  workout: WorkoutPlan;
  onClose: () => void;
  onStart: (workout: WorkoutPlan) => void;
}

export default function WorkoutPreview({
  workout,
  onClose,
  onStart,
}: WorkoutPreviewProps) {
  const handleStartWorkout = () => {
    onStart(workout);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 justify-end bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <LinearGradient
            colors={["#FFD3D3", "#ffeded"]}
            locations={[0, 0.8]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="rounded-t-3xl px-6 py-4"
            style={{ maxHeight: "80%" }}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center p-6 border-b border-[#32393d]/20">
              <H2 className="text-[#32393d] text-2xl flex-1">
                {workout.workout_name}
              </H2>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={28} color="#32393d" />
              </TouchableOpacity>
            </View>

            {/* Exercise List */}
            <View className="flex-1 py-4">
              {workout.exercises.length === 0 ? (
                <P className="text-[#32393d] text-center py-8">
                  No exercises in this workout
                </P>
              ) : (
                <>
                  <H3 className="text-[#32393d] mb-4">
                    {workout.exercises.length} Exercise
                    {workout.exercises.length !== 1 ? "s" : ""}
                  </H3>
                  {workout.exercises.map((exercise, index) => (
                    <View
                      key={`${exercise.exercise_lib_id}-${index}`}
                      className="bg-white/90 rounded-lg p-4 mb-3 flex-row items-center"
                    >
                      <View className="w-8 h-8 rounded-full bg-[#32393d] items-center justify-center mr-3">
                        <P className="text-white font-bold">{index + 1}</P>
                      </View>
                      <P className="text-[#32393d] text-lg flex-1">
                        {exercise.name}
                      </P>
                    </View>
                  ))}
                </>
              )}
            </View>

            {/* Start Button */}
            <View className="p-6 border-t border-[#32393d]/20">
              <TouchableOpacity
                className="bg-[#32393d] rounded-lg py-4 items-center"
                onPress={handleStartWorkout}
              >
                <P className="text-white font-bold text-lg">Start Workout</P>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
