import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { useAuth } from "./AuthContext";

export interface ExerciseStat {
  exercise_lib_id: number;
  exercise_name: string;
  total_sets: number;
  total_reps: number;
  total_volume: number;
  max_weight: number;
  last_performed: string | null;
  times_performed: number;
}

export interface ExerciseSetHistory {
  exercise_lib_id: number;
  set_number: number;
  reps: number;
  weight: number;
}

interface ExerciseStatsContextType {
  stats: Map<number, ExerciseStat>;
  loading: boolean;
  error: string | null;
  getStatsByExerciseId: (exerciseId: number) => ExerciseStat | undefined;
  getLastPerformance: (exerciseId: number) => ExerciseSetHistory[] | undefined;
  fetchLastPerformanceForExercises: (exerciseIds: number[]) => Promise<void>;
  refreshStats: () => Promise<void>;
}

const ExerciseStatsContext = createContext<
  ExerciseStatsContextType | undefined
>(undefined);

export function ExerciseStatsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [stats, setStats] = useState<Map<number, ExerciseStat>>(new Map());
  const [lastPerformance, setLastPerformance] = useState<
    Map<number, ExerciseSetHistory[]>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.rpc(
        "get_all_user_exercise_stats",
        { p_profile_id: user.id },
      );

      if (fetchError) throw fetchError;

      const statsMap = new Map<number, ExerciseStat>(
        (data || []).map((stat: ExerciseStat) => [stat.exercise_lib_id, stat]),
      );

      setStats(statsMap);
    } catch (err) {
      console.error("Error fetching exercise stats:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch exercise stats",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchLastPerformanceForExercises = async (exerciseIds: number[]) => {
    if (!user?.id || exerciseIds.length === 0) return;

    try {
      const { data, error: fetchError } = await supabase.rpc(
        "get_last_exercise_performance",
        {
          p_profile_id: user.id,
          p_exercise_ids: exerciseIds,
        },
      );

      if (fetchError) throw fetchError;

      // Group the results by exercise_lib_id
      const performanceMap = new Map<number, ExerciseSetHistory[]>();

      (data || []).forEach((row: ExerciseSetHistory) => {
        const existing = performanceMap.get(row.exercise_lib_id) || [];
        existing.push({
          exercise_lib_id: row.exercise_lib_id,
          set_number: row.set_number,
          reps: row.reps,
          weight: row.weight,
        });
        performanceMap.set(row.exercise_lib_id, existing);
      });

      // Merge with existing lastPerformance
      setLastPerformance((prev) => {
        const newMap = new Map(prev);
        performanceMap.forEach((value, key) => {
          newMap.set(key, value);
        });
        return newMap;
      });
    } catch (err) {
      console.error("Error fetching last exercise performance:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.id]);

  const getStatsByExerciseId = (exerciseId: number) => {
    return stats.get(exerciseId);
  };

  const getLastPerformance = (exerciseId: number) => {
    return lastPerformance.get(exerciseId);
  };

  const refreshStats = async () => {
    await fetchStats();
  };

  return (
    <ExerciseStatsContext.Provider
      value={{
        stats,
        loading,
        error,
        getStatsByExerciseId,
        getLastPerformance,
        fetchLastPerformanceForExercises,
        refreshStats,
      }}
    >
      {children}
    </ExerciseStatsContext.Provider>
  );
}

export function useExerciseStats() {
  const context = useContext(ExerciseStatsContext);
  if (context === undefined) {
    throw new Error(
      "useExerciseStats must be used within an ExerciseStatsProvider",
    );
  }
  return context;
}
