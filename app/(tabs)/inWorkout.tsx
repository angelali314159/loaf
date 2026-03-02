import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
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
import {
  ExerciseStatsProvider,
  useExerciseStats,
} from "../../contexts/ExerciseStatsContext";
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
  isPR: boolean;
  showConfetti: boolean;
  previousReps: number | null;
  previousLbs: number | null;
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

type PopupType =
  | "incomplete"
  | "emptyValues"
  | "error"
  | "updateWorkout"
  | "saveNewWorkout"
  | "nameWorkout";

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

function ConfettiAnimation({ onComplete }: { onComplete: () => void }) {
  const particles = useRef(
    Array.from({ length: 12 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(1),
    })),
  ).current;

  useEffect(() => {
    const animations = particles.map((particle, index) => {
      const angle = (index / 12) * 2 * Math.PI;
      const distance = 30 + Math.random() * 20;

      return Animated.parallel([
        Animated.timing(particle.x, {
          toValue: Math.cos(angle) * distance,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(particle.y, {
          toValue: Math.sin(angle) * distance - 20,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(particle.scale, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start(() => {
      onComplete();
    });
  }, []);

  const colors = [
    "#FFD700",
    "#FFA500",
    "#FF6347",
    "#32CD32",
    "#1E90FF",
    "#FF69B4",
  ];

  return (
    <View
      style={{ position: "absolute", left: -15, top: 0, width: 30, height: 30 }}
    >
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={{
            position: "absolute",
            left: 15,
            top: 15,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: colors[index % colors.length],
            transform: [
              { translateX: particle.x },
              { translateY: particle.y },
              { scale: particle.scale },
            ],
            opacity: particle.opacity,
          }}
        />
      ))}
    </View>
  );
}

function InWorkoutContent() {
  const params = useLocalSearchParams();
  const workoutId = params.workoutId as string;
  const workoutName = params.workoutName as string;
  const passedExercises = params.exercises as string;
  const isSavedWorkout = params.isSavedWorkout === "true";

  // Determine the display name for the workout
  const displayWorkoutName =
    workoutName && workoutName.trim()
      ? workoutName
      : `${getTodayDateStr()} Workout`;

  const { user } = useAuth();
  const router = useRouter();

  // Access exercise stats from context
  const {
    getStatsByExerciseId,
    getLastPerformance,
    fetchLastPerformanceForExercises,
  } = useExerciseStats();

  // Track PRs achieved during this workout
  const [achievedPRs, setAchievedPRs] = useState<Map<number, PRData>>(
    new Map(),
  );

  // Timer state
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [exerciseBlocks, setExerciseBlocks] = useState<ExerciseBlock[]>([]);
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Track if workout should be saved (toggleable via paw icon)
  const [shouldSaveWorkout, setShouldSaveWorkout] = useState(isSavedWorkout);

  // Track original exercises to detect modifications
  const [originalExerciseIds, setOriginalExerciseIds] = useState<number[]>([]);
  const [hasWorkoutBeenModified, setHasWorkoutBeenModified] = useState(false);

  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState<PopupType>("incomplete");
  const [newWorkoutName, setNewWorkoutName] = useState("");

  const selectedExercises = useMemo(
    () => exerciseBlocks.map((b) => b.exercise),
    [exerciseBlocks],
  );

  const totalSets = useMemo(
    () =>
      exerciseBlocks.reduce(
        (sum, b) => sum + b.sets.filter((s) => s.done).length,
        0,
      ),
    [exerciseBlocks],
  );

  const totalLbs = useMemo(() => {
    return exerciseBlocks.reduce((sum, b) => {
      return (
        sum +
        b.sets.filter((s) => s.done).reduce((s2, r) => s2 + r.reps * r.lbs, 0)
      );
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

  const loadWorkoutData = async () => {
    if (workoutId === "new") {
      setExerciseBlocks([]);
      setOriginalExerciseIds([]);
      setLoading(false);
      return;
    }

    if (passedExercises) {
      try {
        const parsed = JSON.parse(passedExercises);
        const exerciseIds = parsed.map((item: any) => item.exercise_lib_id);

        // Store original exercise IDs for comparison
        setOriginalExerciseIds(exerciseIds);

        // Fetch last performance for all exercises
        await fetchLastPerformanceForExercises(exerciseIds);

        const formattedExercises: ExerciseBlock[] = parsed.map((item: any) => {
          const lastPerf = getLastPerformance(item.exercise_lib_id);

          if (lastPerf && lastPerf.length > 0) {
            // Use previous performance as template
            return {
              exercise: {
                exercise_lib_id: item.exercise_lib_id,
                name: item.name,
                category: item.category || null,
                equipment: item.equipment || null,
              },
              sets: lastPerf.map((set) => ({
                setNumber: set.set_number,
                reps: 0,
                lbs: 0,
                done: false,
                isPR: false,
                showConfetti: false,
                previousReps: set.reps,
                previousLbs: set.weight,
              })),
            };
          }

          // Default to 3 empty sets if no history
          return {
            exercise: {
              exercise_lib_id: item.exercise_lib_id,
              name: item.name,
              category: item.category || null,
              equipment: item.equipment || null,
            },
            sets: [
              {
                setNumber: 1,
                reps: 0,
                lbs: 0,
                done: false,
                isPR: false,
                showConfetti: false,
                previousReps: null,
                previousLbs: null,
              },
              {
                setNumber: 2,
                reps: 0,
                lbs: 0,
                done: false,
                isPR: false,
                showConfetti: false,
                previousReps: null,
                previousLbs: null,
              },
              {
                setNumber: 3,
                reps: 0,
                lbs: 0,
                done: false,
                isPR: false,
                showConfetti: false,
                previousReps: null,
                previousLbs: null,
              },
            ],
          };
        });

        setExerciseBlocks(formattedExercises);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing exercises:", error);
        setExerciseBlocks([]);
        setOriginalExerciseIds([]);
        setLoading(false);
      }
    } else {
      setExerciseBlocks([]);
      setOriginalExerciseIds([]);
      setLoading(false);
    }
  };

  // Check if workout has been modified whenever exerciseBlocks changes
  useEffect(() => {
    if (!isSavedWorkout || originalExerciseIds.length === 0) return;

    const currentIds = exerciseBlocks.map((b) => b.exercise.exercise_lib_id);
    const isModified =
      currentIds.length !== originalExerciseIds.length ||
      !currentIds.every((id, idx) => id === originalExerciseIds[idx]);

    setHasWorkoutBeenModified(isModified);
  }, [exerciseBlocks, originalExerciseIds, isSavedWorkout]);

  const handleAddExercises = () => setShowExerciseList(true);

  const handleSelectExercise = async (exercise: Exercise) => {
    // Check if exercise exists
    const exists = exerciseBlocks.some(
      (b) => b.exercise.exercise_lib_id === exercise.exercise_lib_id,
    );

    if (exists) {
      setExerciseBlocks((prev) =>
        prev.filter(
          (b) => b.exercise.exercise_lib_id !== exercise.exercise_lib_id,
        ),
      );
      return;
    }

    // Fetch last performance for this exercise
    await fetchLastPerformanceForExercises([exercise.exercise_lib_id]);
    const lastPerf = getLastPerformance(exercise.exercise_lib_id);

    setExerciseBlocks((prev) => {
      if (lastPerf && lastPerf.length > 0) {
        // Use previous performance as template
        return [
          ...prev,
          {
            exercise,
            sets: lastPerf.map((set) => ({
              setNumber: set.set_number,
              reps: 0,
              lbs: 0,
              done: false,
              isPR: false,
              showConfetti: false,
              previousReps: set.reps,
              previousLbs: set.weight,
            })),
          },
        ];
      }

      // Default to 3 empty sets if no history
      return [
        ...prev,
        {
          exercise,
          sets: [
            {
              setNumber: 1,
              reps: 0,
              lbs: 0,
              done: false,
              isPR: false,
              showConfetti: false,
              previousReps: null,
              previousLbs: null,
            },
            {
              setNumber: 2,
              reps: 0,
              lbs: 0,
              done: false,
              isPR: false,
              showConfetti: false,
              previousReps: null,
              previousLbs: null,
            },
            {
              setNumber: 3,
              reps: 0,
              lbs: 0,
              done: false,
              isPR: false,
              showConfetti: false,
              previousReps: null,
              previousLbs: null,
            },
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
    // Remove any PRs for this exercise
    setAchievedPRs((prev) => {
      const newMap = new Map(prev);
      newMap.delete(exercise.exercise_lib_id);
      return newMap;
    });
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
          isPR: false,
          showConfetti: false,
          previousReps: null,
          previousLbs: null,
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
    // Recalculate PRs for this exercise after removing a set
    recalculatePRsForExercise(exerciseId);
  };

  const recalculatePRsForExercise = (exerciseId: number) => {
    setExerciseBlocks((prev) => {
      const block = prev.find((b) => b.exercise.exercise_lib_id === exerciseId);
      if (!block) return prev;

      const stats = getStatsByExerciseId(exerciseId);
      const previousMaxWeight = stats?.max_weight ?? 0;
      const isFirstTimeExercise = !stats;

      // Find the highest weight among completed sets
      const completedSets = block.sets.filter((s) => s.done && s.lbs > 0);
      const maxWeightInWorkout = Math.max(
        0,
        ...completedSets.map((s) => s.lbs),
      );

      if (
        completedSets.length > 0 &&
        (isFirstTimeExercise || maxWeightInWorkout > previousMaxWeight)
      ) {
        setAchievedPRs((prevPRs) => {
          const newMap = new Map(prevPRs);
          newMap.set(exerciseId, {
            exercise_id: exerciseId,
            exercise_name: block.exercise.name,
            new_weight: maxWeightInWorkout,
            previous_weight: previousMaxWeight,
          });
          return newMap;
        });
      } else {
        setAchievedPRs((prevPRs) => {
          const newMap = new Map(prevPRs);
          newMap.delete(exerciseId);
          return newMap;
        });
      }

      return prev.map((b) => {
        if (b.exercise.exercise_lib_id !== exerciseId) return b;
        return {
          ...b,
          sets: b.sets.map((s) => ({
            ...s,
            isPR:
              s.done &&
              s.lbs > 0 &&
              s.lbs === maxWeightInWorkout &&
              (isFirstTimeExercise || s.lbs > previousMaxWeight),
            showConfetti: false,
          })),
        };
      });
    });
  };

  const toggleDone = (exerciseId: number, setNumber: number) => {
    setExerciseBlocks((prev) =>
      prev.map((b) => {
        if (b.exercise.exercise_lib_id !== exerciseId) return b;

        const updatedSets = b.sets.map((r) => {
          if (r.setNumber !== setNumber) return r;

          const newDoneState = !r.done;

          if (newDoneState) {
            // Check if this is a PR
            const stats = getStatsByExerciseId(exerciseId);
            const previousMaxWeight = stats?.max_weight ?? 0;
            const isFirstTimeExercise = !stats;
            const currentPR = achievedPRs.get(exerciseId);
            const currentMaxInWorkout = currentPR?.new_weight ?? 0;

            // It's a PR if:
            // 1. First time doing this exercise, OR
            // 2. Weight is greater than previous max AND greater than or equal to current workout max
            const isPR =
              isFirstTimeExercise ||
              (r.lbs > previousMaxWeight && r.lbs >= currentMaxInWorkout);

            if (isPR && r.lbs > 0) {
              // Update achieved PRs
              setAchievedPRs((prevPRs) => {
                const newMap = new Map(prevPRs);
                newMap.set(exerciseId, {
                  exercise_id: exerciseId,
                  exercise_name: b.exercise.name,
                  new_weight: r.lbs,
                  previous_weight: previousMaxWeight,
                });
                return newMap;
              });
            }

            return {
              ...r,
              done: true,
              isPR: isPR && r.lbs > 0,
              showConfetti: isPR && r.lbs > 0,
            };
          } else {
            // Unchecking - will recalculate PRs after state update
            return { ...r, done: false, isPR: false, showConfetti: false };
          }
        });

        // Recalculate which sets should show as PR (only the highest weight set)
        const completedSets = updatedSets.filter((s) => s.done && s.lbs > 0);
        const stats = getStatsByExerciseId(exerciseId);
        const previousMaxWeight = stats?.max_weight ?? 0;
        const isFirstTimeExercise = !stats;
        const maxWeightInWorkout = Math.max(
          0,
          ...completedSets.map((s) => s.lbs),
        );

        // Update achieved PRs based on final state
        if (
          completedSets.length > 0 &&
          (isFirstTimeExercise || maxWeightInWorkout > previousMaxWeight)
        ) {
          setAchievedPRs((prevPRs) => {
            const newMap = new Map(prevPRs);
            newMap.set(exerciseId, {
              exercise_id: exerciseId,
              exercise_name: b.exercise.name,
              new_weight: maxWeightInWorkout,
              previous_weight: previousMaxWeight,
            });
            return newMap;
          });
        } else {
          // No PR for this exercise - remove from achievedPRs
          setAchievedPRs((prevPRs) => {
            const newMap = new Map(prevPRs);
            newMap.delete(exerciseId);
            return newMap;
          });
        }

        const finalSets = updatedSets.map((s) => ({
          ...s,
          isPR:
            s.done &&
            s.lbs > 0 &&
            s.lbs === maxWeightInWorkout &&
            (isFirstTimeExercise || s.lbs > previousMaxWeight),
        }));

        return { ...b, sets: finalSets };
      }),
    );
  };

  const clearConfetti = (exerciseId: number, setNumber: number) => {
    setExerciseBlocks((prev) =>
      prev.map((b) => {
        if (b.exercise.exercise_lib_id !== exerciseId) return b;
        return {
          ...b,
          sets: b.sets.map((r) =>
            r.setNumber === setNumber ? { ...r, showConfetti: false } : r,
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

        const updatedSets = b.sets.map((r) =>
          r.setNumber === setNumber ? { ...r, [field]: asNum } : r,
        );

        // If changing lbs, recalculate PRs for completed sets
        if (field === "lbs") {
          const completedSets = updatedSets.filter((s) => s.done && s.lbs > 0);
          const stats = getStatsByExerciseId(exerciseId);
          const previousMaxWeight = stats?.max_weight ?? 0;
          const isFirstTimeExercise = !stats;
          const maxWeightInWorkout = Math.max(
            0,
            ...completedSets.map((s) => s.lbs),
          );

          // Update achieved PRs
          if (
            completedSets.length > 0 &&
            (isFirstTimeExercise || maxWeightInWorkout > previousMaxWeight)
          ) {
            setAchievedPRs((prevPRs) => {
              const newMap = new Map(prevPRs);
              newMap.set(exerciseId, {
                exercise_id: exerciseId,
                exercise_name: b.exercise.name,
                new_weight: maxWeightInWorkout,
                previous_weight: previousMaxWeight,
              });
              return newMap;
            });
          } else {
            // No PR - remove from list
            setAchievedPRs((prevPRs) => {
              const newMap = new Map(prevPRs);
              newMap.delete(exerciseId);
              return newMap;
            });
          }

          const finalSets = updatedSets.map((s) => ({
            ...s,
            isPR:
              s.done &&
              s.lbs > 0 &&
              s.lbs === maxWeightInWorkout &&
              (isFirstTimeExercise || s.lbs > previousMaxWeight),
            showConfetti: false,
          }));

          return { ...b, sets: finalSets };
        }

        return { ...b, sets: updatedSets };
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
              workoutId !== "new" && isSavedWorkout
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

  const saveNewWorkoutRoutine = async (
    workoutNameToSave: string,
  ): Promise<number | null> => {
    if (!user?.id) return null;

    try {
      // Create new workout with the provided name
      const { data: newWorkout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          profile_id: user.id,
          workout_name: workoutNameToSave,
        })
        .select("workout_id")
        .single();

      if (workoutError) throw workoutError;

      // Insert workout exercises
      const exerciseRecords = exerciseBlocks.map((block, index) => ({
        workout_id: newWorkout.workout_id,
        exercise_lib_id: block.exercise.exercise_lib_id,
        exercise_order: index + 1,
      }));

      const { error: exercisesError } = await supabase
        .from("workout_exercises")
        .insert(exerciseRecords);

      if (exercisesError) throw exercisesError;

      return newWorkout.workout_id;
    } catch (error) {
      console.error("Error saving new workout routine:", error);
      return null;
    }
  };

  const updateExistingWorkoutRoutine = async (): Promise<boolean> => {
    if (!user?.id || workoutId === "new") return false;

    try {
      const numericWorkoutId = parseInt(workoutId);

      // Delete existing workout exercises
      const { error: deleteError } = await supabase
        .from("workout_exercises")
        .delete()
        .eq("workout_id", numericWorkoutId);

      if (deleteError) throw deleteError;

      // Insert new workout exercises
      const exerciseRecords = exerciseBlocks.map((block, index) => ({
        workout_id: numericWorkoutId,
        exercise_lib_id: block.exercise.exercise_lib_id,
        exercise_order: index + 1,
      }));

      const { error: insertError } = await supabase
        .from("workout_exercises")
        .insert(exerciseRecords);

      if (insertError) throw insertError;

      return true;
    } catch (error) {
      console.error("Error updating workout routine:", error);
      return false;
    }
  };

  const handleFinishWorkout = async () => {
    const allSetsCompleted = exerciseBlocks.every((block) =>
      block.sets.every((set) => set.done),
    );

    if (!allSetsCompleted) {
      setPopupType("incomplete");
      setShowPopup(true);
      return;
    }

    // Check for sets where reps or lbs were never entered (still null/placeholder "-")
    // A typed value of 0 is allowed; only block if the field was never touched (value === 0 AND no previous value to fall back on, meaning it shows "-")
    const hasEmptyValues = exerciseBlocks.some((block) =>
      block.sets.some(
        (set) =>
          set.done &&
          ((set.reps === 0 && set.previousReps === null) ||
            (set.lbs === 0 && set.previousLbs === null)),
      ),
    );

    if (hasEmptyValues) {
      setPopupType("emptyValues");
      setShowPopup(true);
      return;
    }

    // Check if we need to show a popup for saving/updating the routine
    if (isSavedWorkout && hasWorkoutBeenModified && shouldSaveWorkout) {
      // Existing workout was modified - ask to update or save as new
      setPopupType("updateWorkout");
      setShowPopup(true);
      return;
    }

    if (!isSavedWorkout && shouldSaveWorkout && exerciseBlocks.length > 0) {
      // New workout and user wants to save it - ask for name first
      setNewWorkoutName(displayWorkoutName);
      setPopupType("nameWorkout");
      setShowPopup(true);
      return;
    }

    // No routine saving needed, just finish and save to history
    await completeWorkout();
  };

  const completeWorkout = async (
    saveAction?: "saveNew" | "update" | "discard",
    workoutNameToSave?: string,
  ) => {
    setSaving(true);

    // Handle workout routine saving based on action
    if (saveAction === "saveNew") {
      const nameToUse = workoutNameToSave || displayWorkoutName;
      const newWorkoutId = await saveNewWorkoutRoutine(nameToUse);
      if (!newWorkoutId) {
        setPopupType("error");
        setShowPopup(true);
        setSaving(false);
        return;
      }
    } else if (saveAction === "update") {
      const success = await updateExistingWorkoutRoutine();
      if (!success) {
        setPopupType("error");
        setShowPopup(true);
        setSaving(false);
        return;
      }
    }
    // "discard" means don't save/update routine, but still save to history

    // Always save workout to history
    const workoutHistoryId = await saveWorkoutToHistory();

    if (!workoutHistoryId) {
      setPopupType("error");
      setShowPopup(true);
      setSaving(false);
      return;
    }

    // Use locally tracked PRs
    const prs = Array.from(achievedPRs.values());

    const totalReps = exerciseBlocks.reduce(
      (sum, b) => sum + b.sets.reduce((s2, r) => s2 + r.reps, 0),
      0,
    );

    const workoutData = {
      workoutHistoryId: workoutHistoryId.toString(),
      workoutName: workoutNameToSave || displayWorkoutName,
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

  const handlePopupAction = async (action: string) => {
    setShowPopup(false);

    if (popupType === "updateWorkout") {
      if (action === "update") {
        await completeWorkout("update");
      } else if (action === "saveNew") {
        // When saving as new from an existing workout, ask for name
        setNewWorkoutName(displayWorkoutName);
        setPopupType("nameWorkout");
        setShowPopup(true);
      }
    } else if (popupType === "nameWorkout") {
      if (action === "save") {
        const nameToSave = newWorkoutName.trim() || displayWorkoutName;
        await completeWorkout("saveNew", nameToSave);
      } else if (action === "discard") {
        await completeWorkout("discard");
      }
    } else if (popupType === "saveNewWorkout") {
      if (action === "save") {
        await completeWorkout("saveNew");
      } else if (action === "discard") {
        await completeWorkout("discard");
      }
    }
  };

  const renderPopup = () => {
    if (popupType === "incomplete") {
      return (
        <PopupMessage
          visible={showPopup}
          title="Incomplete Workout"
          message="Please complete all sets before finishing your workout."
          type="error"
          onClose={() => setShowPopup(false)}
        />
      );
    }

    if (popupType === "emptyValues") {
      return (
        <PopupMessage
          visible={showPopup}
          title="Missing Values"
          message="Please enter reps and weight for all completed sets. A value of 0 is allowed."
          type="error"
          onClose={() => setShowPopup(false)}
        />
      );
    }

    if (popupType === "error") {
      return (
        <PopupMessage
          visible={showPopup}
          title="Error"
          message="Failed to save workout. Please try again."
          type="error"
          onClose={() => setShowPopup(false)}
        />
      );
    }

    if (popupType === "updateWorkout") {
      return (
        <PopupMessage
          visible={showPopup}
          title="Update Workout?"
          message="Do you want to update this routine with the new changes?"
          type="info"
          confirmText="Update"
          onClose={() => handlePopupAction("update")}
          secondaryAction={{
            text: "Save as new",
            onPress: () => handlePopupAction("saveNew"),
          }}
        />
      );
    }

    if (popupType === "nameWorkout") {
      return (
        <PopupMessage
          visible={showPopup}
          title="Name Your Workout"
          message="Enter a name for this workout routine:"
          type="info"
          confirmText="Save"
          onClose={() => handlePopupAction("save")}
          secondaryAction={{
            text: "Don't Save",
            onPress: () => handlePopupAction("discard"),
          }}
          textInput={{
            value: newWorkoutName,
            onChangeText: setNewWorkoutName,
            placeholder: "e.g., Push Day, Leg Day...",
          }}
        />
      );
    }

    if (popupType === "saveNewWorkout") {
      return (
        <PopupMessage
          visible={showPopup}
          title="Save Workout?"
          message="Do you want to save this workout for future use?"
          type="info"
          confirmText="Save workout"
          onClose={() => handlePopupAction("save")}
          secondaryAction={{
            text: "Discard",
            onPress: () => handlePopupAction("discard"),
          }}
        />
      );
    }

    return null;
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
                style={[
                  { width: 22, height: 22 },
                  !shouldSaveWorkout && { tintColor: "#B9B9B9" },
                ]}
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
                      <View style={{ width: 30 }} />
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
                        {/* Trophy for PR */}
                        <View
                          style={{
                            width: 30,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {row.isPR && (
                            <View style={{ position: "relative" }}>
                              <FontAwesome5
                                name="trophy"
                                size={18}
                                color="#FFD700"
                              />
                              {row.showConfetti && (
                                <ConfettiAnimation
                                  onComplete={() =>
                                    clearConfetti(
                                      block.exercise.exercise_lib_id,
                                      row.setNumber,
                                    )
                                  }
                                />
                              )}
                            </View>
                          )}
                        </View>

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

                        {/* 2: Reps - show previous as placeholder */}
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
                            placeholder={
                              row.previousReps !== null
                                ? String(row.previousReps)
                                : "-"
                            }
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

                        {/* 3: lbs - show previous as placeholder */}
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
                            placeholder={
                              row.previousLbs !== null
                                ? String(row.previousLbs)
                                : "-"
                            }
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

      {renderPopup()}
    </View>
  );
}

export default function InWorkout() {
  return (
    <ExerciseStatsProvider>
      <ExerciseLibraryProvider>
        <InWorkoutContent />
      </ExerciseLibraryProvider>
    </ExerciseStatsProvider>
  );
}
