import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { ExerciseLibraryProvider } from "../../contexts/ExerciseLibraryContext";
import { supabase } from "../../utils/supabase";

interface Exercise {
  exercise_lib_id: number;
  name: string;
  category: string | null;
  equipment: string | null;
  video_link: string | null;
}

type SetRow = {
  setNumber: number;
  reps: number;
  lbs: number;
  done: boolean;
};

type ExerciseBlock = {
  exercise: Exercise;
  sets: SetRow[];
};

interface PRData {
  exercise_id: number;
  exercise_name: string;
  new_weight: number;
  previous_weight: number;
}

function formatHMS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function getTodayDateStr() {
  const d = new Date();
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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

function InWorkoutContent() {
  const params = useLocalSearchParams();
  const workoutId = params.workoutId as string;
  const workoutName = params.workoutName as string;
  const passedExercises = params.exercises as string;
  const isSavedWorkout = params.isSavedWorkout === "true";

  const { user } = useAuth();
  const router = useRouter();

  // Timer state
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [exerciseBlocks, setExerciseBlocks] = useState<ExerciseBlock[]>([]);
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Track if workout should be saved (toggleable via paw icon)
  const [shouldSaveWorkout, setShouldSaveWorkout] = useState(isSavedWorkout);

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
    return exerciseBlocks.reduce((sum, b) => {
      return sum + b.sets.reduce((s2, r) => s2 + r.reps * r.lbs, 0);
    }, 0);
  }, [exerciseBlocks]);

  // Timer effect
  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Load workout data
  useEffect(() => {
    loadWorkoutData();
  }, [workoutId, passedExercises]);

  const loadWorkoutData = () => {
    if (workoutId === "new") {
      setExerciseBlocks([]);
      setLoading(false);
      return;
    }

    if (passedExercises) {
      try {
        const parsed = JSON.parse(passedExercises);
        const formattedExercises: ExerciseBlock[] = parsed.map((item: any) => ({
          exercise: {
            exercise_lib_id: item.exercise_lib_id,
            name: item.name,
            category: item.category || null,
            equipment: item.equipment || null,
          },
          sets: [
            { setNumber: 1, reps: 0, lbs: 0, done: false },
            { setNumber: 2, reps: 0, lbs: 0, done: false },
            { setNumber: 3, reps: 0, lbs: 0, done: false },
          ],
        }));
        setExerciseBlocks(formattedExercises);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing exercises:", error);
        setExerciseBlocks([]);
        setLoading(false);
      }
    } else {
      setExerciseBlocks([]);
      setLoading(false);
    }
  };

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

      // Auto-fill with 3 default sets
      return [
        ...prev,
        {
          exercise,
          sets: [
            { setNumber: 1, reps: 0, lbs: 0, done: false },
            { setNumber: 2, reps: 0, lbs: 0, done: false },
            { setNumber: 3, reps: 0, lbs: 0, done: false },
          ],
        },
      ];
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

  const saveWorkoutToHistory = async () => {
    if (!user?.id) {
      console.error("No user found");
      return null;
    }

    try {
      const durationMinutes = Math.floor(seconds / 60);

      const { data: workoutHistoryData, error: workoutHistoryError } =
        await supabase
          .from("workout_history")
          .insert({
            profile_id: user.id,
            workout_id:
              workoutId !== "new" && shouldSaveWorkout
                ? parseInt(workoutId)
                : null,
            duration_minutes: durationMinutes,
            completed_at: new Date().toISOString(),
          })
          .select("workout_history_id")
          .single();

      if (workoutHistoryError) {
        console.error("Error saving workout history:", workoutHistoryError);
        throw workoutHistoryError;
      }

      const workoutHistoryId = workoutHistoryData.workout_history_id;

      const exerciseHistoryRecords = [];
      for (const block of exerciseBlocks) {
        for (const set of block.sets) {
          exerciseHistoryRecords.push({
            profile_id: user.id,
            workout_history_id: workoutHistoryId,
            exercise_id: block.exercise.exercise_lib_id,
            set_number: set.setNumber,
            reps: set.reps,
            weight: set.lbs,
          });
        }
      }

      if (exerciseHistoryRecords.length > 0) {
        const { error: exerciseHistoryError } = await supabase
          .from("exercise_history")
          .insert(exerciseHistoryRecords);

        if (exerciseHistoryError) {
          console.error("Error saving exercise history:", exerciseHistoryError);
          throw exerciseHistoryError;
        }
      }

      console.log("Workout saved successfully with ID:", workoutHistoryId);
      return workoutHistoryId;
    } catch (error) {
      console.error("Error in saveWorkoutToHistory:", error);
      return null;
    }
  };

  const checkForPRs = async (workoutHistoryId: number): Promise<PRData[]> => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase.rpc("check_workout_prs", {
        p_profile_id: user.id,
        p_workout_history_id: workoutHistoryId,
      });

      if (error) {
        console.error("Error checking for PRs:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in checkForPRs:", error);
      return [];
    }
  };

  const handleFinishWorkout = async () => {
    const allSetsCompleted = exerciseBlocks.every((block) =>
      block.sets.every((set) => set.done),
    );

    if (!allSetsCompleted) {
      setPopupConfig({
        title: "Incomplete Workout",
        message: "Please complete all sets before finishing your workout.",
        type: "error",
        onClose: () => setShowPopup(false),
      });
      setShowPopup(true);
      return;
    }

    setSaving(true);

    const workoutHistoryId = await saveWorkoutToHistory();

    if (!workoutHistoryId) {
      setPopupConfig({
        title: "Error",
        message: "Failed to save workout. Please try again.",
        type: "error",
        onClose: () => setShowPopup(false),
      });
      setShowPopup(true);
      setSaving(false);
      return;
    }

    const prs = await checkForPRs(workoutHistoryId);

    const totalReps = exerciseBlocks.reduce(
      (sum, b) => sum + b.sets.reduce((s2, r) => s2 + r.reps, 0),
      0,
    );

    const workoutData = {
      workoutHistoryId: workoutHistoryId.toString(),
      workoutName: displayWorkoutName,
      duration: seconds,
      exercises: exerciseBlocks.length,
      sets: totalSets,
      totalReps: totalReps,
      weightLifted: totalLbs,
      prs: JSON.stringify(prs),
    };

    setSaving(false);

    router.push({
      pathname: "/(tabs)/workoutComplete",
      params: {
        workoutData: JSON.stringify(workoutData),
      },
    });
  };

  const finishButtonIsDark = exerciseBlocks.length > 0;

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text style={{ fontSize: 14, color: "#32393d" }}>
          Loading workout...
        </Text>
      </View>
    );
  }

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
            <View className="flex-row items-center flex-1 mr-2">
              <TouchableOpacity
                onPress={() => router.back()}
                className="pr-3 py-2"
              >
                <Feather name="arrow-left" size={26} color="#32393d" />
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ fontSize: 17, fontWeight: "700", color: "#32393d" }}
                >
                  {workoutName || `${getTodayDateStr()} Workout`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="p-2"
              activeOpacity={0.8}
              onPress={() => setShouldSaveWorkout(!shouldSaveWorkout)}
            >
              <Image
                source={
                  shouldSaveWorkout
                    ? require("../../assets/images/paw-filled.png")
                    : require("../../assets/images/cat_paw.png")
                }
                style={{
                  width: 22,
                  height: 22,
                  tintColor: shouldSaveWorkout ? undefined : "#B9B9B9",
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Stats row */}
          <View className="mt-10 flex-row items-center justify-between">
            <View className="flex-1 items-center">
              <Text style={{ fontSize: 12, color: "#32393d" }}>Duration</Text>
              <Text style={{ fontSize: 16, color: "#32393d", marginTop: 8 }}>
                {formatHMS(seconds)}
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
              onPress={handleFinishWorkout}
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

                    {/* Table header */}
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
                            value={row.reps === 0 ? "" : String(row.reps)}
                            onChangeText={(v) =>
                              updateSetValue(
                                block.exercise.exercise_lib_id,
                                row.setNumber,
                                "reps",
                                v,
                              )
                            }
                            keyboardType="number-pad"
                            placeholder="-"
                            placeholderTextColor="#999"
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
                            value={row.lbs === 0 ? "" : String(row.lbs)}
                            onChangeText={(v) =>
                              updateSetValue(
                                block.exercise.exercise_lib_id,
                                row.setNumber,
                                "lbs",
                                v,
                              )
                            }
                            keyboardType="number-pad"
                            placeholder="-"
                            placeholderTextColor="#999"
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

          {exerciseBlocks.length === 0 && (
            <View className="mt-10 items-center justify-center py-8">
              <Text
                style={{ fontSize: 14, color: "#32393d", textAlign: "center" }}
              >
                No exercises yet.{"\n"}Add your first exercise!
              </Text>
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

export default function InWorkout() {
  return (
    <ExerciseLibraryProvider>
      <InWorkoutContent />
    </ExerciseLibraryProvider>
  );
}
