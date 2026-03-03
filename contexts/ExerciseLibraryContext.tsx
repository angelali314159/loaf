import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

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
  exercisesByMuscle: Record<string, ExerciseLibraryItem[]>;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ExerciseLibraryContext = createContext<ExerciseLibraryContextType | undefined>(undefined);

export function ExerciseLibraryProvider({ children }: { children: React.ReactNode }) {
  const [exercises, setExercises] = useState<ExerciseLibraryItem[]>([]);
  const [exercisesByMuscle, setExercisesByMuscle] = useState<Record<string, ExerciseLibraryItem[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      // Attempt to fetch with muscles. If this fails due to schema mismatch, 
      // we might need to adjust the query.
      const { data, error } = await supabase
        .from('exercise_library')
        .select(`
          *,
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

      setExercises(formatted);

      const byMuscle: Record<string, ExerciseLibraryItem[]> = {};
      formatted.forEach(ex => {
        ex.muscles?.forEach(m => {
          const mName = m.name;
          if (!byMuscle[mName]) byMuscle[mName] = [];
          byMuscle[mName].push(ex);
        });
      });
      setExercisesByMuscle(byMuscle);

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
    <ExerciseLibraryContext.Provider value={{ exercises, exercisesByMuscle, loading, refresh: fetchExercises }}>
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
