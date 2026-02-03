import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../utils/supabase";
import { H2, H3, P } from "./typography";

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
  selectedExercises?: Exercise[];
}

export default function ExerciseList({
  visible,
  onClose,
  onSelectExercise,
  selectedExercises = [],
}: ExerciseListProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([]);
  const [availableMuscles, setAvailableMuscles] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      fetchExercises();
      fetchFilterOptions();
    }
  }, [visible]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedEquipment, selectedMuscles, exercises]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("exercise_library")
        .select("exercise_lib_id, name, category, equipment, video_link")
        .order("name");

      if (error) throw error;

      setExercises(data || []);
      setFilteredExercises(data || []);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      // Fetch unique equipment types
      const { data: equipmentData } = await supabase
        .from("exercise_library")
        .select("equipment")
        .not("equipment", "is", null);

      const uniqueEquipment = [
        ...new Set(equipmentData?.map((item) => item.equipment) || []),
      ].filter(Boolean) as string[];
      setAvailableEquipment(uniqueEquipment);

      // Fetch unique muscle groups
      const { data: muscleData } = await supabase
        .from("muscles")
        .select("name")
        .order("name");

      setAvailableMuscles(muscleData?.map((m) => m.name) || []);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const applyFilters = () => {
    let filtered = exercises;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((ex) =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply equipment filter
    if (selectedEquipment.length > 0) {
      filtered = filtered.filter(
        (ex) => ex.equipment && selectedEquipment.includes(ex.equipment),
      );
    }

    // Apply muscle filter (requires join with exercise_muscles table)
    if (selectedMuscles.length > 0) {
      // This will be implemented with a more complex query
      // For now, we'll filter by category as a placeholder
      filtered = filtered.filter(
        (ex) => ex.category && selectedMuscles.includes(ex.category),
      );
    }

    setFilteredExercises(filtered);
  };

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(equipment)
        ? prev.filter((e) => e !== equipment)
        : [...prev, equipment],
    );
  };

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle],
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedEquipment([]);
    setSelectedMuscles([]);
  };

  const isExerciseSelected = (exerciseId: number) => {
    return selectedExercises.some((ex) => ex.exercise_lib_id === exerciseId);
  };

  const handleSelectExercise = (exercise: Exercise) => {
    onSelectExercise(exercise);
    router.push({
      pathname: "/(tabs)/exercisePreview",
      params: { exerciseName: exercise.name },
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20">
          <LinearGradient
            colors={["#DDF8FE", "#ebf9fd"]}
            locations={[0, 0.8]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="flex-1 rounded-t-3xl"
          >
            {/* Header */}
            <View className="flex-row justify-between items-center p-6 border-b border-[#32393d]/20">
              <H2 className="text-[#32393d] text-2xl">Add Exercise</H2>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={28} color="#32393d" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="px-6 pt-4 pb-2">
              <View className="flex-row items-center bg-white rounded-lg px-4 py-2 border border-[#32393d]/20">
                <Feather name="search" size={20} color="#666" />
                <TextInput
                  className="flex-1 ml-2 text-[#32393d]"
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#999"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Feather name="x-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Filter Button */}
            <View className="px-6 pb-4 flex-row justify-between items-center">
              <TouchableOpacity
                className="flex-row items-center bg-white rounded-lg px-4 py-2 border border-[#32393d]"
                onPress={() => setShowFilters(!showFilters)}
              >
                <Feather name="filter" size={18} color="#32393d" />
                <P className="ml-2 text-[#32393d] font-semibold">Filters</P>
                {(selectedEquipment.length > 0 ||
                  selectedMuscles.length > 0) && (
                  <View className="ml-2 bg-[#32393d] rounded-full w-5 h-5 items-center justify-center">
                    <P className="text-white text-xs font-bold">
                      {selectedEquipment.length + selectedMuscles.length}
                    </P>
                  </View>
                )}
              </TouchableOpacity>

              {(selectedEquipment.length > 0 || selectedMuscles.length > 0) && (
                <TouchableOpacity onPress={clearFilters}>
                  <P className="text-[#32393d] underline">Clear all</P>
                </TouchableOpacity>
              )}
            </View>

            {/* Filters Panel */}
            {showFilters && (
              <View className="px-6 pb-4 bg-white/50 border-y border-[#32393d]/20">
                {/* Equipment Filter */}
                <View className="mb-4">
                  <H3 className="text-[#32393d] mb-2">Equipment</H3>
                  <View className="flex-row flex-wrap gap-2">
                    {availableEquipment.map((equipment) => (
                      <TouchableOpacity
                        key={equipment}
                        className={`rounded-full px-4 py-2 border ${
                          selectedEquipment.includes(equipment)
                            ? "bg-[#32393d] border-[#32393d]"
                            : "bg-white border-[#32393d]/30"
                        }`}
                        onPress={() => toggleEquipment(equipment)}
                      >
                        <P
                          className={
                            selectedEquipment.includes(equipment)
                              ? "text-white"
                              : "text-[#32393d]"
                          }
                        >
                          {equipment}
                        </P>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Muscle Filter */}
                <View>
                  <H3 className="text-[#32393d] mb-2">Target Muscles</H3>
                  <View className="flex-row flex-wrap gap-2">
                    {availableMuscles.slice(0, 8).map((muscle) => (
                      <TouchableOpacity
                        key={muscle}
                        className={`rounded-full px-4 py-2 border ${
                          selectedMuscles.includes(muscle)
                            ? "bg-[#32393d] border-[#32393d]"
                            : "bg-white border-[#32393d]/30"
                        }`}
                        onPress={() => toggleMuscle(muscle)}
                      >
                        <P
                          className={
                            selectedMuscles.includes(muscle)
                              ? "text-white"
                              : "text-[#32393d]"
                          }
                        >
                          {muscle}
                        </P>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Exercise List */}
            <ScrollView
              className="flex-1 px-6"
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {loading ? (
                <View className="items-center justify-center py-8">
                  <P className="text-[#32393d]">Loading exercises...</P>
                </View>
              ) : filteredExercises.length === 0 ? (
                <View className="items-center justify-center py-8">
                  <P className="text-[#32393d] text-center">
                    No exercises found.{"\n"}Try adjusting your filters.
                  </P>
                </View>
              ) : (
                <>
                  <P className="text-[#32393d] text-sm mb-4 opacity-70">
                    {filteredExercises.length} exercise
                    {filteredExercises.length !== 1 ? "s" : ""}
                  </P>
                  {filteredExercises.map((exercise) => {
                    const isSelected = isExerciseSelected(
                      exercise.exercise_lib_id,
                    );
                    return (
                      <TouchableOpacity
                        key={exercise.exercise_lib_id}
                        className={`rounded-lg p-4 mb-3 border-2 ${
                          isSelected
                            ? "bg-[#32393d] border-[#32393d]"
                            : "bg-white border-[#32393d]/20"
                        }`}
                        onPress={() => handleSelectExercise(exercise)}
                      >
                        <View className="flex-row justify-between items-center">
                          <View className="flex-1">
                            <P
                              className={`font-bold text-lg mb-1 ${
                                isSelected ? "text-white" : "text-[#32393d]"
                              }`}
                            >
                              {exercise.name}
                            </P>
                            <View className="flex-row flex-wrap gap-2">
                              {exercise.equipment && (
                                <View
                                  className={`rounded px-2 py-1 ${
                                    isSelected ? "bg-white/20" : "bg-[#DDF8FE]"
                                  }`}
                                >
                                  <P
                                    className={`text-xs ${
                                      isSelected
                                        ? "text-white"
                                        : "text-[#32393d]"
                                    }`}
                                  >
                                    {exercise.equipment}
                                  </P>
                                </View>
                              )}
                              {exercise.category && (
                                <View
                                  className={`rounded px-2 py-1 ${
                                    isSelected ? "bg-white/20" : "bg-[#FFD3D3]"
                                  }`}
                                >
                                  <P
                                    className={`text-xs ${
                                      isSelected
                                        ? "text-white"
                                        : "text-[#32393d]"
                                    }`}
                                  >
                                    {exercise.category}
                                  </P>
                                </View>
                              )}
                            </View>
                          </View>
                          <Feather
                            name={isSelected ? "check-circle" : "circle"}
                            size={24}
                            color={isSelected ? "#FCDE8C" : "#32393d"}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}
            </ScrollView>

            {/* Done Button - Fixed at bottom */}
            <View className="p-6 bg-white border-t border-[#32393d]/20">
              <TouchableOpacity
                className="bg-[#32393d] rounded-lg py-4 items-center"
                onPress={onClose}
              >
                <P className="text-white font-bold text-lg">
                  Done{" "}
                  {selectedExercises.length > 0 &&
                    `(${selectedExercises.length})`}
                </P>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}
