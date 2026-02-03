import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export interface ExerciseLibraryItem {
  exercise_lib_id: number;
  name: string;
  category: string | null;
  equipment: string | null;
  video_link: string | null;
  muscles: {
    muscle_id: string;
    name: string;
    is_primary: boolean;
  }[];
}

interface ExerciseLibraryContextType {
  exercises: ExerciseLibraryItem[];
  loading: boolean;
  error: string | null;
  getExerciseByName: (name: string) => ExerciseLibraryItem | undefined;
  refreshExercises: () => Promise<void>;
}

const ExerciseLibraryContext = createContext<
  ExerciseLibraryContextType | undefined
>(undefined);

export function ExerciseLibraryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [exercises, setExercises] = useState<ExerciseLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch exercise library with muscle information
      const { data: exerciseData, error: exerciseError } = await supabase.from(
        "exercise_library",
      ).select(`
          exercise_lib_id,
          name,
          category,
          equipment,
          video_link,
          exercise_muscles (
            is_primary,
            muscles (
              muscle_id,
              name
            )
          )
        `);

      if (exerciseError) throw exerciseError;

      // Transform data to flatten muscle information
      const transformedData: ExerciseLibraryItem[] = (exerciseData || []).map(
        (exercise) => ({
          exercise_lib_id: exercise.exercise_lib_id,
          name: exercise.name,
          category: exercise.category,
          equipment: exercise.equipment,
          video_link: exercise.video_link,
          muscles: (exercise.exercise_muscles || []).map((em: any) => ({
            muscle_id: em.muscles.muscle_id,
            name: em.muscles.name,
            is_primary: em.is_primary,
          })),
        }),
      );

      setExercises(transformedData);
    } catch (err) {
      console.error("Error fetching exercise library:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch exercises",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const getExerciseByName = (name: string) => {
    return exercises.find((ex) => ex.name.toLowerCase() === name.toLowerCase());
  };

  const refreshExercises = async () => {
    await fetchExercises();
  };

  return (
    <ExerciseLibraryContext.Provider
      value={{
        exercises,
        loading,
        error,
        getExerciseByName,
        refreshExercises,
      }}
    >
      {children}
    </ExerciseLibraryContext.Provider>
  );
}

export function useExerciseLibrary() {
  const context = useContext(ExerciseLibraryContext);
  if (context === undefined) {
    throw new Error(
      "useExerciseLibrary must be used within an ExerciseLibraryProvider",
    );
  }
  return context;
}
