import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import ExerciseList from "../../components/ExerciseList";
import PopupMessage from "../../components/PopupMessage";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabase";

interface Exercise {
  exercise_lib_id: number;
  name: string;
  category: string | null;
  equipment: string | null;
}

type SetRow = {
  setNumber: number;
  reps: number;
  lbs: number;
  done: boolean;
};

type ExerciseBlock = {
  exercise: Exercise;
  sets: SetRow[]; // <-- starts EMPTY (no defaults)
};

function formatHMS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// Helper styles for a 5-column evenly spaced "table"
// - Each column has equal width (flex: 1)
// - Leftmost and rightmost align with container edges
// - Equal gaps come naturally because each column is the same width
const fiveColRowStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  paddingLeft: 0,
  paddingRight: 0,
};

const fiveColCellStyle = {
  flex: 1,
  flexBasis: 0,
  alignItems: "center" as const,
};

export default function CreateWorkout() {
  const { user } = useAuth();

  const [workoutName, setWorkoutName] = useState("11/1/25 Workout");
  const [exerciseBlocks, setExerciseBlocks] = useState<ExerciseBlock[]>([]);
  const [showExerciseList, setShowExerciseList] = useState(false);

  // (UI only) so the screenshot style has a value
  const [durationSeconds] = useState(1);

  const [saving, setSaving] = useState(false);

  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "success" | "info",
    onClose: () => {},
  });

  const selectedExercises = useMemo(
    () => exerciseBlocks.map((b) => b.exercise),
    [exerciseBlocks],
  );

  const totalSets = useMemo(
    () => exerciseBlocks.reduce((sum, b) => sum + b.sets.length, 0),
    [exerciseBlocks],
  );

  const totalLbs = useMemo(() => {
    // sum only “done” sets (keeps it sensible with checkboxes)
    return exerciseBlocks.reduce((sum, b) => {
      return sum + b.sets.reduce((s2, r) => s2 + (r.done ? r.lbs : 0), 0);
    }, 0);
  }, [exerciseBlocks]);

  const handleAddExercises = () => setShowExerciseList(true);

  const handleSelectExercise = (exercise: Exercise) => {
    setExerciseBlocks((prev) => {
      const exists = prev.some(
        (b) => b.exercise.exercise_lib_id === exercise.exercise_lib_id,
      );

      if (exists) {
        return prev.filter(
          (b) => b.exercise.exercise_lib_id !== exercise.exercise_lib_id,
        );
      }

      // IMPORTANT: no default rows
      return [...prev, { exercise, sets: [] }];
    });
  };

  const handleRemoveExercise = (exercise: Exercise) => {
    setExerciseBlocks((prev) =>
      prev.filter(
        (b) => b.exercise.exercise_lib_id !== exercise.exercise_lib_id,
      ),
    );
  };

  const addSetRow = (exerciseId: number) => {
    setExerciseBlocks((prev) =>
      prev.map((b) => {
        if (b.exercise.exercise_lib_id !== exerciseId) return b;
        const nextNum = b.sets.length + 1;
        const newRow: SetRow = {
          setNumber: nextNum,
          reps: 0,
          lbs: 0,
          done: false,
        };
        return { ...b, sets: [...b.sets, newRow] };
      }),
    );
  };

  const removeSetRow = (exerciseId: number, setNumber: number) => {
    setExerciseBlocks((prev) =>
      prev.map((b) => {
        if (b.exercise.exercise_lib_id !== exerciseId) return b;
        const kept = b.sets.filter((r) => r.setNumber !== setNumber);
        const renumbered = kept.map((r, idx) => ({ ...r, setNumber: idx + 1 }));
        return { ...b, sets: renumbered };
      }),
    );
  };

  const toggleDone = (exerciseId: number, setNumber: number) => {
    setExerciseBlocks((prev) =>
      prev.map((b) => {
        if (b.exercise.exercise_lib_id !== exerciseId) return b;
        return {
          ...b,
          sets: b.sets.map((r) =>
            r.setNumber === setNumber ? { ...r, done: !r.done } : r,
          ),
        };
      }),
    );
  };

  const updateSetValue = (
    exerciseId: number,
    setNumber: number,
    field: "reps" | "lbs",
    value: string,
  ) => {
    const asNum = Number(value.replace(/[^\d]/g, "")) || 0;

    setExerciseBlocks((prev) =>
      prev.map((b) => {
        if (b.exercise.exercise_lib_id !== exerciseId) return b;
        return {
          ...b,
          sets: b.sets.map((r) =>
            r.setNumber === setNumber ? { ...r, [field]: asNum } : r,
          ),
        };
      }),
    );
  };

  const handleSaveWorkout = async () => {
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

    if (exerciseBlocks.length === 0) {
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

      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          profile_id: user.id,
          workout_name: workoutName.trim(),
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      const workoutExercises = exerciseBlocks.map((b, index) => ({
        workout_id: workout.workout_id,
        exercise_lib_id: b.exercise.exercise_lib_id,
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

  const finishButtonIsDark = exerciseBlocks.length > 0;

  return (
    <View className="flex-1 bg-white">
      {/* SEMICIRCLE GRADIENT BACKGROUND */}
      <View
        pointerEvents="none"
        style={{ position: "absolute", top: 0, left: 0, right: 0 }}
      >
        <Svg
          height={Dimensions.get("screen").height * 0.5}
          width={Dimensions.get("screen").width}
        >
          <Defs>
            <RadialGradient
              id="topSemiCircle"
              cx="50%"
              cy="0%"
              rx="150%"
              ry="70%"
              gradientUnits="objectBoundingBox"
            >
              <Stop offset="0%" stopColor="#FCDE8C" stopOpacity={0.9} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.1} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#topSemiCircle)" />
        </Svg>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-16">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.back()}
                className="pr-3 py-2"
              >
                <Feather name="arrow-left" size={26} color="#32393d" />
              </TouchableOpacity>

              <Text
                style={{ fontSize: 34, fontWeight: "700", color: "#32393d" }}
              >
                {workoutName}
              </Text>
            </View>

            <TouchableOpacity className="p-2" activeOpacity={0.8}>
              <Image
                source={require("../../assets/images/cat_paw.png")}
                style={{
                  width: 22,
                  height: 22,
                  tintColor: "#B9B9B9",
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* (Hidden input kept from your version) */}
          <View className="mt-3">
            <TextInput
              value={workoutName}
              onChangeText={setWorkoutName}
              placeholder="Workout name"
              placeholderTextColor="#9A9A9A"
              className="text-[#32393d]"
              style={{ fontSize: 14, opacity: 0.0, height: 0 }}
            />
          </View>

          {/* Stats row */}
          <View className="mt-10 flex-row items-center justify-between">
            <View className="flex-1 items-center">
              <Text style={{ fontSize: 12, color: "#32393d" }}>Duration</Text>
              <Text style={{ fontSize: 16, color: "#32393d", marginTop: 8 }}>
                {formatHMS(durationSeconds)}
              </Text>
            </View>

            <View className="h-12 w-[1px] bg-[#B9B9B9] opacity-80" />

            <View className="flex-1 items-center">
              <Text style={{ fontSize: 12, color: "#32393d" }}>lbs</Text>
              <Text style={{ fontSize: 16, color: "#32393d", marginTop: 8 }}>
                {totalLbs}
              </Text>
            </View>

            <View className="h-12 w-[1px] bg-[#B9B9B9] opacity-80" />

            <View className="flex-1 items-center">
              <Text style={{ fontSize: 12, color: "#32393d" }}>Sets</Text>
              <Text style={{ fontSize: 16, color: "#32393d", marginTop: 8 }}>
                {totalSets}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View className="mt-10 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleSaveWorkout}
              disabled={saving}
              activeOpacity={0.85}
              className="flex-1 mr-4 rounded-full py-3 items-center"
              style={{
                backgroundColor: finishButtonIsDark ? "#2E3742" : "#E8E1CF",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: finishButtonIsDark ? "#F6D88A" : "#32393d",
                }}
              >
                {saving ? "Saving..." : "Finish workout"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAddExercises}
              activeOpacity={0.85}
              className="flex-1 rounded-full py-3 items-center"
              style={{ backgroundColor: "#FCDE8C" }}
            >
              <Text
                style={{ fontSize: 12, fontWeight: "700", color: "#32393d" }}
              >
                Add Exercise
              </Text>
            </TouchableOpacity>
          </View>

          {/* Exercises */}
          {exerciseBlocks.length > 0 && (
            <View className="mt-10">
              {exerciseBlocks.map((block, idx) => {
                const isLast = idx === exerciseBlocks.length - 1;

                return (
                  <View key={block.exercise.exercise_lib_id} className="pb-4">
                    {/* Exercise header row */}
                    <View className="flex-row items-center justify-between">
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "400",
                          color: "#32393d",
                        }}
                      >
                        {block.exercise.name}
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          addSetRow(block.exercise.exercise_lib_id)
                        }
                        className="p-2"
                        activeOpacity={0.7}
                      >
                        <Feather name="plus" size={28} color="#F6B83B" />
                      </TouchableOpacity>
                    </View>

                    {/* Table header — 5 evenly spaced columns, no extra left/right padding */}
                    <View style={{ ...fiveColRowStyle, marginTop: 14 }}>
                      <View style={fiveColCellStyle}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#6A6A6A",
                            textAlign: "center",
                          }}
                        >
                          Sets
                        </Text>
                      </View>
                      <View style={fiveColCellStyle}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#6A6A6A",
                            textAlign: "center",
                          }}
                        >
                          Reps
                        </Text>
                      </View>
                      <View style={fiveColCellStyle}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#6A6A6A",
                            textAlign: "center",
                          }}
                        >
                          lbs
                        </Text>
                      </View>
                      <View style={fiveColCellStyle} />
                      <View style={fiveColCellStyle} />
                    </View>

                    {/* Rows */}
                    {block.sets.map((row) => (
                      <View
                        key={`${block.exercise.exercise_lib_id}-${row.setNumber}`}
                        style={{ ...fiveColRowStyle, marginTop: 18 }}
                      >
                        {/* 1: Sets */}
                        <View style={fiveColCellStyle}>
                          <Text
                            style={{
                              fontSize: 14,
                              color: "#4D4D4D",
                              textAlign: "center",
                            }}
                          >
                            {row.setNumber}
                          </Text>
                        </View>

                        {/* 2: Reps */}
                        <View style={fiveColCellStyle}>
                          <TextInput
                            value={String(row.reps)}
                            onChangeText={(v) =>
                              updateSetValue(
                                block.exercise.exercise_lib_id,
                                row.setNumber,
                                "reps",
                                v,
                              )
                            }
                            keyboardType="number-pad"
                            style={{
                              width: "100%",
                              fontSize: 14,
                              color: "#4D4D4D",
                              textAlign: "center",
                              paddingVertical: 0,
                            }}
                          />
                        </View>

                        {/* 3: lbs */}
                        <View style={fiveColCellStyle}>
                          <TextInput
                            value={String(row.lbs)}
                            onChangeText={(v) =>
                              updateSetValue(
                                block.exercise.exercise_lib_id,
                                row.setNumber,
                                "lbs",
                                v,
                              )
                            }
                            keyboardType="number-pad"
                            style={{
                              width: "100%",
                              fontSize: 14,
                              color: "#4D4D4D",
                              textAlign: "center",
                              paddingVertical: 0,
                            }}
                          />
                        </View>

                        {/* 4: checkbox */}
                        <View style={fiveColCellStyle}>
                          <TouchableOpacity
                            onPress={() =>
                              toggleDone(
                                block.exercise.exercise_lib_id,
                                row.setNumber,
                              )
                            }
                            activeOpacity={0.8}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 7,
                              borderWidth: 1.5,
                              borderColor: "#3A3A3A",
                              backgroundColor: row.done
                                ? "#FCDE8C"
                                : "transparent",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {row.done ? (
                              <Feather name="check" size={16} color="#2E3742" />
                            ) : null}
                          </TouchableOpacity>
                        </View>

                        {/* 5: minus */}
                        <View style={fiveColCellStyle}>
                          <TouchableOpacity
                            onPress={() =>
                              removeSetRow(
                                block.exercise.exercise_lib_id,
                                row.setNumber,
                              )
                            }
                            activeOpacity={0.6}
                          >
                            <Feather name="minus" size={26} color="#6A6A6A" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}

                    {!isLast && <View className="mt-6 h-[1px] bg-[#D2D2D2]" />}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <ExerciseList
        visible={showExerciseList}
        onClose={() => setShowExerciseList(false)}
        onSelectExercise={handleSelectExercise}
        onRemoveExercise={handleRemoveExercise}
        selectedExercises={selectedExercises}
      />

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
