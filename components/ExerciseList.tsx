import { Feather } from "@expo/vector-icons";
import Octicons from "@expo/vector-icons/Octicons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../utils/supabase";
import { router } from "expo-router";


interface Exercise {
  exercise_lib_id: number;
  name: string;
  category: string | null;
  equipment: string | null;
  video_link: string | null;
}

interface ExerciseListProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
  onRemoveExercise?: (exercise: Exercise) => void;
  selectedExercises?: Exercise[];
  onRestoreWorkout?: () => void;
  onSaveEdits?: () => void;
}

export default function ExerciseList({
  visible,
  onClose,
  onSelectExercise,
  onRemoveExercise,
  selectedExercises = [],
  onRestoreWorkout,
  onSaveEdits,
}: ExerciseListProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;
    fetchExercises();
  }, [visible]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("exercise_library")
        .select("exercise_lib_id, name, category, equipment, video_link")
        .order("name");

      if (error) throw error;
      setExercises(data || []);
    } catch (e) {
      console.error("Error fetching exercises:", e);
    } finally {
      setLoading(false);
    }
  };

  const selectedIds = useMemo(
    () => new Set(selectedExercises.map((e) => e.exercise_lib_id)),
    [selectedExercises],
  );

  const filteredExercises = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter((ex) => ex.name.toLowerCase().includes(q));
  }, [exercises, searchQuery]);

  const toggleExercise = (ex: Exercise) => {
    const isSelected = selectedIds.has(ex.exercise_lib_id);

    if (!isSelected) {
      onSelectExercise(ex);
      return;
    }

    if (onRemoveExercise) {
      onRemoveExercise(ex);
    } else {
      onSelectExercise(ex);
    }
  };

  const Avatar = ({ name }: { name: string }) => (
    <View className="w-16 h-16 rounded-full bg-[#DADDE3] items-center justify-center overflow-hidden">
      <Text className="text-[#32393d] font-bold">
        {name.slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Floating close button */}
        <View className="items-center pt-10">
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            className="w-16 h-16 rounded-full bg-[#0B1626] items-center justify-center"
          >
            <Feather name="x" size={34} color="#FCDE8C" />
          </TouchableOpacity>
        </View>

        {/* Sheet */}
        <View className="h-[60%] px-6 pt-6">
          <View
            className="flex-1 bg-white overflow-hidden"
            style={{ borderTopLeftRadius: 32, borderTopRightRadius: 32 }}
          >
            {/* Search */}
            <View className="px-6 pt-6 pb-4">
              <View className="flex-row items-center">
                <View className="flex-1 flex-row items-center bg-[#E6E6E6] rounded-full px-4 py-2">
                  <Feather name="search" size={18} color="#666" />
                  <TextInput
                    className="flex-1 ml-3 text-[#111] text-base py-0"
                    placeholder="Hammer curls..."
                    placeholderTextColor="#777"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={{
                      paddingVertical: 0,
                    }}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                      <Feather name="x-circle" size={18} color="#666" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Filter icon */}
                <TouchableOpacity
                  className="ml-4 p-2"
                  onPress={() => console.log("filters")}
                >
                  <Octicons name="filter" size={26} color="#0B1626" />
                </TouchableOpacity>
              </View>
            </View>

            {/* List */}
            <ScrollView
              className="flex-1 px-6"
              contentContainerStyle={{ paddingBottom: 110 }}
            >
              {loading ? (
                <View className="py-10 items-center">
                  <Text className="text-[#32393d]">Loading…</Text>
                </View>
              ) : filteredExercises.length === 0 ? (
                <View className="py-10 items-center">
                  <Text className="text-[#32393d]">No exercises found.</Text>
                </View>
              ) : (
                filteredExercises.map((ex) => {
                  const isSelected = selectedIds.has(ex.exercise_lib_id);

                  return (
                    // Full-width touch target, BUT overlay only on inner content
                    <TouchableOpacity
                      key={ex.exercise_lib_id}
                      activeOpacity={0.75}
                      onPress={() => toggleExercise(ex)}
                      onLongPress={() =>
                        router.push({
                          pathname: "/(tabs)/exercisePreview",
                          params: { exerciseName: ex.name },
                        })
                      }
                      delayLongPress={250}
                      className="py-3"
                    >
                      {/* This is the highlighted "pill" area */}
                      <View
                        className={`flex-row items-center rounded-2xl px-4 py-4 ${
                          isSelected ? "bg-[#F7D57A]" : "bg-transparent"
                        }`}
                      >
                        <Avatar name={ex.name} />

                        <View className="flex-1 ml-4">
                          <Text className="text-[#0B1626] text-xl font-semibold">
                            {ex.name}
                          </Text>
                          <Text className="text-[#6B7280] text-base mt-1">
                            {[ex.category, ex.equipment]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </Text>
                        </View>

                        <View className="ml-4">
                          <Feather
                            name={isSelected ? "minus" : "plus"}
                            size={32}
                            color="#4B5563"
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            {/* Bottom buttons */}
            <View className="px-6 py-5">
              <View className="flex-row">
                <TouchableOpacity
                  className="flex-1 rounded-full py-2 items-center justify-center bg-[#EFE6C8]"
                  onPress={onRestoreWorkout ?? (() => console.log("restore"))}
                >
                  <Text className="text-[#0B1626] font-semibold text-lg" style = {{fontSize: 12,}}>
                    Restore Workout
                  </Text>
                </TouchableOpacity>

                <View className="w-4" />

                <TouchableOpacity
                  className="flex-1 rounded-full py-2 items-center justify-center bg-[#F7D57A]"
                  onPress={onSaveEdits ?? (() => console.log("save"))}
                >
                  <Text className="text-[#0B1626] font-semibold text-lg " style = {{fontSize: 12,}}>
                    Save Edits
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
    zIndex: 9999,
    justifyContent: "flex-end",
  },
});