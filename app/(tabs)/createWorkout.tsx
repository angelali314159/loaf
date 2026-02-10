import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
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
      const exists = prev.some((b) => b.exercise.exercise_lib_id === exercise.exercise_lib_id);

      // ExerciseList is “toggle” behavior, so selecting again should remove
      if (exists) {
        return prev.filter((b) => b.exercise.exercise_lib_id !== exercise.exercise_lib_id);
      }

      // IMPORTANT: no default rows
      return [...prev, { exercise, sets: [] }];
    });
  };

  const handleRemoveExercise = (exercise: Exercise) => {
    setExerciseBlocks((prev) =>
      prev.filter((b) => b.exercise.exercise_lib_id !== exercise.exercise_lib_id),
    );
  };

  const addSetRow = (exerciseId: number) => {
    setExerciseBlocks((prev) =>
      prev.map((b) => {
        if (b.exercise.exercise_lib_id !== exerciseId) return b;
        const nextNum = b.sets.length + 1;

        // starting values (no “default rows” on add-exercise; but when user taps + for a set,
        // we need *something* — use 0 so it’s not assuming)
        const newRow: SetRow = { setNumber: nextNum, reps: 0, lbs: 0, done: false };

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
    <LinearGradient
      colors={["#F6E6C1", "#F2F0EF", "#F2F0EF"]}
      locations={[0, 0.25, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-16">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => router.back()} className="pr-3 py-2">
                <Feather name="arrow-left" size={26} color="#32393d" />
              </TouchableOpacity>

              {/* Title */}
              <Text style={{ fontSize: 34, fontWeight: "700", color: "#32393d" }}>
                {workoutName}
              </Text>
            </View>

            <TouchableOpacity className="p-2" activeOpacity={0.8}>
              <FontAwesome5 name="paw" size={22} color="#B9B9B9" />
            </TouchableOpacity>
          </View>

          {/* If you want editable title */}
          <View className="mt-3">
            <TextInput
              value={workoutName}
              onChangeText={setWorkoutName}
              placeholder="Workout name"
              placeholderTextColor="#9A9A9A"
              className="text-[#32393d]"
              style={{
                fontSize: 14,
                opacity: 0.0, // <-- set to 1 if you actually want the input visible
                height: 0,
              }}
            />
          </View>

          {/* Stats row */}
          <View className="mt-10 flex-row items-center justify-between">
            <View className="flex-1 items-center">
              <Text style={{ fontSize: 18, color: "#32393d" }}>Duration</Text>
              <Text style={{ fontSize: 24, color: "#32393d", marginTop: 8 }}>
                {formatHMS(durationSeconds)}
              </Text>
            </View>

            <View className="h-12 w-[1px] bg-[#B9B9B9] opacity-80" />

            <View className="flex-1 items-center">
              <Text style={{ fontSize: 18, color: "#32393d" }}>lbs</Text>
              <Text style={{ fontSize: 24, color: "#32393d", marginTop: 8 }}>
                {totalLbs}
              </Text>
            </View>

            <View className="h-12 w-[1px] bg-[#B9B9B9] opacity-80" />

            <View className="flex-1 items-center">
              <Text style={{ fontSize: 18, color: "#32393d" }}>Sets</Text>
              <Text style={{ fontSize: 24, color: "#32393d", marginTop: 8 }}>
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
              className="flex-1 mr-4 rounded-full py-4 items-center"
              style={{
                backgroundColor: finishButtonIsDark ? "#2E3742" : "#E8E1CF",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
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
              className="flex-1 rounded-full py-4 items-center"
              style={{ backgroundColor: "#F6D88A" }}
            >
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#32393d" }}>
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
                      <Text style={{ fontSize: 26, fontWeight: "400", color: "#32393d" }}>
                        {block.exercise.name}
                      </Text>

                      <TouchableOpacity
                        onPress={() => addSetRow(block.exercise.exercise_lib_id)}
                        className="p-2"
                        activeOpacity={0.7}
                      >
                        <Feather name="plus" size={28} color="#F6B83B" />
                      </TouchableOpacity>
                    </View>

                    {/* Table header */}
                    <View className="mt-4 flex-row items-center">
                      <Text style={{ width: 70, fontSize: 20, color: "#6A6A6A" }}>
                        Sets
                      </Text>
                      <Text style={{ width: 90, fontSize: 20, color: "#6A6A6A" }}>
                        Reps
                      </Text>
                      <Text style={{ width: 90, fontSize: 20, color: "#6A6A6A" }}>
                        lbs
                      </Text>
                      <View style={{ flex: 1 }} />
                      <View style={{ width: 30 }} />
                    </View>

                    {/* Rows (can be empty at first) */}
                    {block.sets.map((row) => (
                      <View
                        key={`${block.exercise.exercise_lib_id}-${row.setNumber}`}
                        className="mt-4 flex-row items-center"
                      >
                        <Text style={{ width: 70, fontSize: 20, color: "#4D4D4D" }}>
                          {row.setNumber}
                        </Text>

                        <TextInput
                          value={String(row.reps)}
                          onChangeText={(v) =>
                            updateSetValue(block.exercise.exercise_lib_id, row.setNumber, "reps", v)
                          }
                          keyboardType="number-pad"
                          className="text-[#4D4D4D]"
                          style={{ width: 90, fontSize: 20 }}
                        />

                        <TextInput
                          value={String(row.lbs)}
                          onChangeText={(v) =>
                            updateSetValue(block.exercise.exercise_lib_id, row.setNumber, "lbs", v)
                          }
                          keyboardType="number-pad"
                          className="text-[#4D4D4D]"
                          style={{ width: 90, fontSize: 20 }}
                        />

                        <View style={{ flex: 1, alignItems: "center" }}>
                          <TouchableOpacity
                            onPress={() => toggleDone(block.exercise.exercise_lib_id, row.setNumber)}
                            activeOpacity={0.8}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 7,
                              borderWidth: 2,
                              borderColor: "#3A3A3A",
                              backgroundColor: row.done ? "#F6D88A" : "transparent",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {row.done ? <Feather name="check" size={18} color="#2E3742" /> : null}
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          onPress={() => removeSetRow(block.exercise.exercise_lib_id, row.setNumber)}
                          activeOpacity={0.6}
                          style={{ width: 30, alignItems: "center" }}
                        >
                          <Feather name="minus" size={26} color="#6A6A6A" />
                        </TouchableOpacity>
                      </View>
                    ))}

                    {/* Divider */}
                    {!isLast && <View className="mt-6 h-[1px] bg-[#D2D2D2]" />}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Exercise List Modal (this is the popup when Add Exercise is pressed) */}
      <ExerciseList
        visible={showExerciseList}
        onClose={() => setShowExerciseList(false)}
        onSelectExercise={handleSelectExercise}
        onRemoveExercise={handleRemoveExercise}
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
    </LinearGradient>
  );
}
