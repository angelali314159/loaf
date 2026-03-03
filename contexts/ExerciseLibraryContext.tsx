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
 *        equipmentList,          // List of all unique equipment values
 *        muscleList,             // List of all unique muscles
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
 *
 *      // Example: Use equipment list for filtering
 *      const equipmentOptions = equipmentList; // ['Barbell', 'Dumbbell', ...]
 *
 *      // Example: Use muscle list for filtering
 *      const muscleOptions = muscleList; // ['Chest', 'Back', 'Legs', ...]
 *    }
 *    ```
 *
 * ## Data Structures
 *
 * - `exercises`: Full exercise details including all muscles (primary & secondary)
 * - `exercisesByMuscle`: Record<string, GroupedExercise[]> - exercises keyed by primary muscle name
 * - `equipmentList`: string[] - sorted list of unique equipment values (null entries excluded)
 * - `muscleList`: string[] - sorted list of all unique muscle names
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export interface ExerciseLibraryItem {
  exercise_lib_id: number;
  name: string;
  category: string | null;
  equipment: string | null;
  video_link: string | null;
  muscles?: {
    muscle_id: number;
    is_primary: boolean;
    name: string;
  }[];
}

interface ExerciseLibraryContextType {
  exercises: ExerciseLibraryItem[];
  exercisesByMuscle: ExercisesByMuscle;
  equipmentList: string[];
  muscleList: string[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const ExerciseLibraryContext = createContext<ExerciseLibraryContextType | undefined>(undefined);

export function ExerciseLibraryProvider({ children }: { children: React.ReactNode }) {
  const [exercises, setExercises] = useState<ExerciseLibraryItem[]>([]);
  const [exercisesByMuscle, setExercisesByMuscle] = useState<ExercisesByMuscle>(
    {},
  );
  const [equipmentList, setEquipmentList] = useState<string[]>([]);
  const [muscleList, setMuscleList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      setLoading(true);
      setError(null);

      const [exerciseResult, groupedResult] = await Promise.all([
        supabase.from("exercise_library").select(`
          exercise_lib_id,
          name,
          category,
          equipment,
          video_link,
          exercise_muscles (
            muscle_id,
            is_primary,
            muscles (
              name
            )
          )
        `)
        .order('name');

      if (error) throw error;

      const formatted: ExerciseLibraryItem[] = (data || []).map((ex: any) => ({
        ...ex,
        muscles: ex.exercise_muscles?.map((em: any) => ({
          muscle_id: em.muscle_id,
          is_primary: em.is_primary,
          name: em.muscles?.name || 'Unknown'
        })) || []
      }));

      const uniqueEquipment = Array.from(
        new Set(
          transformedData
            .map((ex) => ex.equipment)
            .filter((eq): eq is string => eq !== null),
        ),
      ).sort();

      const uniqueMuscles = Array.from(
        new Set(transformedData.flatMap((ex) => ex.muscles.map((m) => m.name))),
      ).sort();

      setExercises(transformedData);
      setExercisesByMuscle(groupedResult.data || {});
      setEquipmentList(uniqueEquipment);
      setMuscleList(uniqueMuscles);
    } catch (err) {
      console.error('Error fetching exercise library:', err);
      // Fallback: try fetching without muscles if the join fails
      try {
        const { data, error } = await supabase
          .from('exercise_library')
          .select('*')
          .order('name');
        
        if (!error && data) {
           setExercises(data as ExerciseLibraryItem[]);
        }
      } catch (retryErr) {
        console.error('Retry failed:', retryErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  return (
    <ExerciseLibraryContext.Provider
      value={{
        exercises,
        exercisesByMuscle,
        equipmentList,
        muscleList,
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
    throw new Error('useExerciseLibrary must be used within an ExerciseLibraryProvider');
  }
  return context;
}
