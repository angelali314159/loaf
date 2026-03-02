/**
 * ExerciseLibraryContext
 * ======================
 *
 * This context provides access to the exercise library data throughout the app.
 *
 * ## Usage
 *
 * 1. Wrap your page with `ExerciseLibraryProvider`:
 *
 *    ```tsx
 *    import { ExerciseLibraryProvider } from '../contexts/ExerciseLibraryContext';
 *
 *    function App() {
 *      return (
 *        <ExerciseLibraryProvider>
 *          <YourComponents />
 *        </ExerciseLibraryProvider>
 *      );
 *    }
 *    ```
 * 
 * ex. :
 * export default function InWorkout() {
   return (
     <ExerciseStatsProvider>
       <ExerciseLibraryProvider>
         <InWorkoutContent />
       </ExerciseLibraryProvider>
     </ExerciseStatsProvider>
   );
 }
 *
 * 2. Access exercise data in any child component:
 *
 *    ```tsx
 *    import { useExerciseLibrary } from '../contexts/ExerciseLibraryContext';
 *
 *    function MyComponent() {
 *      const {
 *        exercises,              // Full list with all muscle info
 *        exercisesByMuscle,      // Exercises grouped by primary muscle
 *        loading,
 *        error,
 *        getExerciseByName,      // Helper to find exercise by name
 *        refreshExercises        // Refetch all data
 *      } = useExerciseLibrary();
 *
 *      // Example: Get all chest exercises
 *      const chestExercises = exercisesByMuscle['Chest'] || [];
 *
 *      // Example: Find a specific exercise
 *      const benchPress = getExerciseByName('Bench Press');
 *    }
 *    ```
 *
 * ## Data Structures
 *
 * - `exercises`: Full exercise details including all muscles (primary & secondary)
 * - `exercisesByMuscle`: Record<string, GroupedExercise[]> - exercises keyed by primary muscle name
 */

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
  image_name?: string | null;
  image_url?: string | null;
}

export interface GroupedExercise {
  exercise_lib_id: number;
  name: string;
  category: string | null;
  equipment: string | null;
  video_link: string | null;
  image_name: string | null;
}

export type ExercisesByMuscle = Record<string, GroupedExercise[]>;

interface ExerciseLibraryContextType {
  exercises: ExerciseLibraryItem[];
  exercisesByMuscle: ExercisesByMuscle;
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
  const [exercisesByMuscle, setExercisesByMuscle] = useState<ExercisesByMuscle>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both data sources in parallel
      const [exerciseResult, groupedResult] = await Promise.all([
        // Fetch exercise library with muscle information
        supabase.from("exercise_library").select(`
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
          ),
          image_name
        `),
        // Fetch exercises grouped by primary muscle
        supabase.rpc("get_exercises_grouped_by_primary_muscle"),
      ]);

      if (exerciseResult.error) throw exerciseResult.error;
      if (groupedResult.error) throw groupedResult.error;

      // Transform data to flatten muscle information
      const transformedData: ExerciseLibraryItem[] = (
        exerciseResult.data || []
      ).map((exercise) => ({
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
        image_name: exercise.image_name,
      }));

      setExercises(transformedData);
      setExercisesByMuscle(groupedResult.data || {});
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
        exercisesByMuscle,
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
