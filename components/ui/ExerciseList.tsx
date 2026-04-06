import { Feather } from "@expo/vector-icons";
import Octicons from "@expo/vector-icons/Octicons";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ExerciseLibraryItem,
  ExerciseLibraryProvider,
  useExerciseLibrary,
} from "../../contexts/ExerciseLibraryContext";
import { BottomFade, TopFade } from "../FadeEdges";
import { H1 } from "../typography";
import Equipment from "./Equipment";
import MuscleGroups from "./muscleGroups";

// ─── Exercise Images ──────────────────────────────────────────────────────────
// Static mapping of all exercise images in assets/images/exercises/
// Add new images here as you add them to the folder
const EXERCISE_IMAGES: Record<string, any> = {
  "filler.jpg": require("../../assets/images/Exercises/filler.jpg"),
  "latPulldown.jpg": require("../../assets/images/Exercises/latPulldown.jpg"),
  "legRaises.jpg": require("../../assets/images/Exercises/legRaises.jpg"),
  "russianTwists.jpg": require("../../assets/images/Exercises/russianTwists.jpg"),
  "shoulderPress.jpg": require("../../assets/images/Exercises/shoulderPress.jpg"),
  "seatedRows.jpg": require("../../assets/images/Exercises/seatedRows.jpg"),
  "shoulderShrugs.jpg": require("../../assets/images/Exercises/shoulderShrugs.jpg"),
  "sidePlanks.jpg": require("../../assets/images/Exercises/sidePlanks.jpg"),
  "sitUps.jpg": require("../../assets/images/Exercises/sitUps.jpg"),
  "standingCalfRaises.jpg": require("../../assets/images/Exercises/standingCalfRaises.jpg"),
  "tricepKickbacks.jpg": require("../../assets/images/Exercises/tricepKickbacks.jpg"),
  "tricepsDips.jpg": require("../../assets/images/Exercises/tricepsDips.jpg"),
  "tricepsRopePulldown.jpg": require("../../assets/images/Exercises/tricepsRopePulldown.jpg"),
  "frontRaise.jpg": require("../../assets/images/Exercises/frontRaise.jpg"),
  "preacherCurl.jpg": require("../../assets/images/Exercises/preacherCurl.jpg"),
  "lateralRaiseCable.jpg": require("../../assets/images/Exercises/lateralRaiseCable.jpg"),
  "latPulldownCable.jpg": require("../../assets/images/Exercises/latPulldownCable.jpg"),
  "seatedCalfRaise.jpg": require("../../assets/images/Exercises/seatedCalfRaise.jpg"),
  "sitUpsBodyweight.jpg": require("../../assets/images/Exercises/sitUpsBodyweight.jpg"),
  "standingCalfRaisesDumbbell.jpg": require("../../assets/images/Exercises/standingCalfRaisesDumbbell.jpg"),
  "tricepDips.jpg": require("../../assets/images/Exercises/tricepsDips.jpg"),
  "skullCrusher.jpg": require("../../assets/images/Exercises/filler.jpg"),
};

function getImageSource(imageName: string | null | undefined) {
  if (!imageName) return null;
  const fileName = imageName.split("/").pop() || imageName;
  return EXERCISE_IMAGES[fileName] || null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Matches ExerciseLibraryItem's shape so callers can pass ExerciseLibraryItem
 * objects in/out without casting. Any extra fields (e.g. `muscles`) are ignored
 * by the parent — TypeScript structural typing means it just works.
 */
export interface Exercise {
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

// ─── Filter Panel ─────────────────────────────────────────────────────────────

interface FilterPanelProps {
  selectedEquipment: string[];
  selectedMuscles: string[];
  onSetEquipment: (groups: string[]) => void;
  onSetMuscles: (groups: string[]) => void;
  onBack: () => void;
  onClear: () => void;
}

function FilterPanel({
  selectedEquipment,
  selectedMuscles,
  onSetEquipment,
  onSetMuscles,
  onBack,
  onClear,
}: FilterPanelProps) {
  const activeCount = selectedEquipment.length + selectedMuscles.length;

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={onBack} className="p-1">
          <Feather name="chevron-left" size={26} color="#0B1626" />
        </TouchableOpacity>
        {activeCount > 0 && (
          <TouchableOpacity onPress={onClear} className="p-1">
            <Text className="text-[#6B7280] text-base">Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        className="flex-1 px-2"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <H1 baseSize={17} className="mb-4 ml-2">
          Equipment
        </H1>
        <Equipment
          selectedEquipments={selectedEquipment}
          setSelectedEquipments={onSetEquipment}
        />

        <H1 baseSize={17} className="mb-4 mt-6 ml-2">
          Target Muscles
        </H1>
        <MuscleGroups
          selectedGroups={selectedMuscles}
          setSelectedGroups={onSetMuscles}
        />
      </ScrollView>
    </View>
  );
}

// ─── Static helpers ────────────────────────────────

function getAvatar(name: string) {
  return (name ?? "?").slice(0, 1).toUpperCase();
}

function getSubtitle(ex: ExerciseLibraryItem): string {
  const primaryMuscles = (ex.muscles ?? [])
    .filter((m) => m.is_primary)
    .map((m) => m.name)
    .join(", ");
  if (primaryMuscles) return primaryMuscles;
  return [ex.category, ex.equipment].filter(Boolean).join(", ") || "—";
}

// ─── Memoized exercise row ─────────────────────────────────────────────────────
// idk if this is done right

interface ExerciseRowProps {
  ex: ExerciseLibraryItem;
  isSelected: boolean;
  onPress: (ex: ExerciseLibraryItem) => void;
}

const ExerciseRow = React.memo(function ExerciseRow({
  ex,
  isSelected,
  onPress,
}: ExerciseRowProps) {
  const imageSource = getImageSource(ex.image_name);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress(ex)}
      onLongPress={() =>
        router.push({
          pathname: "/(tabs)/exercisePreview",
          params: { exerciseName: ex.name },
        })
      }
      delayLongPress={250}
      className="py-3"
    >
      <View
        className={`flex-row items-center rounded-2xl py-2 px-2 gap-5 ${
          isSelected ? "bg-[#F7D57A]" : "bg-transparent"
        }`}
      >
        <View className="w-16 h-16 rounded-full bg-[#DADDE3] items-center justify-center overflow-hidden">
          {imageSource ? (
            <Image
              source={imageSource}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <Text className="text-[#32393d] font-bold">
              {getAvatar(ex.name)}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-[#0B1626] font-semibold text-sm">
            {ex.name}
          </Text>
          <Text className="text-[#6B7280] text-sm mt-1">
            {getSubtitle(ex)}
          </Text>
        </View>
        <View className="">
          <Feather
            name={isSelected ? "minus" : "plus"}
            size={20}
            color="#4B5563"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ─── Main content (must be inside ExerciseLibraryProvider) ───────────────────

function ExerciseListContent({
  visible,
  onClose,
  onSelectExercise,
  onRemoveExercise,
  selectedExercises = [],
  onRestoreWorkout,
  onSaveEdits,
}: ExerciseListProps) {
  // Pull everything from context — no direct Supabase calls needed here
  const { exercises, loading } = useExerciseLibrary();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedEquipment, setSelectedEquipment] = React.useState<string[]>(
    [],
  );
  const [selectedMuscles, setSelectedMuscles] = React.useState<string[]>([]);

  // ── Selected exercise IDs ────────────────────────────────────────────────────
  const selectedIds = useMemo(
    () => new Set(selectedExercises.map((e) => e.exercise_lib_id)),
    [selectedExercises],
  );

  // ── Filtering ────────────────────────────────────────────────────────────────
  const filteredExercises = useMemo<ExerciseLibraryItem[]>(() => {
    let result = [...exercises];

    // Text search
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((ex) => ex.name.toLowerCase().includes(q));
    }

    // Equipment filter
    if (selectedEquipment.length > 0) {
      const equipmentSet = new Set(
        selectedEquipment.map((equipment) => equipment.trim().toLowerCase()),
      );

      result = result.filter((ex) => {
        if (!ex.equipment) {
          // Matches exercises with no equipment if "none" is selected
          return equipmentSet.has("none");
        }
        const value = ex.equipment.trim().toLowerCase();
        return equipmentSet.has(value);
      });
    }

    // Muscle filter — uses the proper muscles array from ExerciseLibraryItem
    if (selectedMuscles.length > 0) {
      const muscleSet = new Set(
        selectedMuscles.map((muscle) => muscle.trim().toLowerCase()),
      );

      result = result.filter((ex) =>
        (ex.muscles ?? []).some((m) =>
          muscleSet.has(m.name.trim().toLowerCase()),
        ),
      );
    }

    return result;
  }, [exercises, searchQuery, selectedEquipment, selectedMuscles]);

  const clearFilters = useCallback(() => {
    setSelectedEquipment([]);
    setSelectedMuscles([]);
  }, []);

  const activeFilterCount = selectedEquipment.length + selectedMuscles.length;

  const handleSaveEditsPress = () => {
    onClose();

    if (!onSaveEdits) return;

    try {
      onSaveEdits();
    } catch (error) {
      console.error("Error in onSaveEdits:", error);
    }
  };

  const toggleExercise = useCallback(
    (ex: ExerciseLibraryItem) => {
      if (selectedIds.has(ex.exercise_lib_id)) {
        onRemoveExercise ? onRemoveExercise(ex) : onSelectExercise(ex);
      } else {
        onSelectExercise(ex);
      }
    },
    [selectedIds, onRemoveExercise, onSelectExercise],
  );

  // ── Stable callbacks ─────────────────────────────────────────────────────────

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* StyleSheet.absoluteFillObject has no NativeWind equivalent */}
      <View style={styles.overlay}>
        {/* Close button */}
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="h-[60%] px-6 pt-6"
        >
          {/* borderTopRadius 32 is off-scale for Tailwind, kept inline */}
          <View
            className="flex-1 bg-white overflow-hidden"
            style={{ borderTopLeftRadius: 32, borderTopRightRadius: 32 }}
          >
            {showFilters ? (
              <>
                <FilterPanel
                  selectedEquipment={selectedEquipment}
                  selectedMuscles={selectedMuscles}
                  onSetEquipment={setSelectedEquipment}
                  onSetMuscles={setSelectedMuscles}
                  onBack={() => setShowFilters(false)}
                  onClear={clearFilters}
                />
                <View className="px-6 py-5">
                  <TouchableOpacity
                    className="rounded-full py-3 items-center justify-center bg-[#0B1626]"
                    onPress={() => setShowFilters(false)}
                  >
                    <Text className="text-[#FCDE8C] font-semibold text-base">
                      {activeFilterCount > 0
                        ? `Apply Filters (${activeFilterCount})`
                        : "Apply Filters"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* Search row */}
                <View className="px-6 pt-6 pb-4">
                  <View className="flex-row items-center">
                    <View className="flex-1 flex-row items-center bg-[#E6E6E6] rounded-full px-4 py-2">
                      <Feather name="search" size={18} color="#666" />
                      <TextInput
                        className="flex-1 ml-3 text-[#111] text-base"
                        placeholder="Hammer curls..."
                        placeholderTextColor="#777"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={{ paddingVertical: 0 }}
                      />
                      {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                          <Feather name="x-circle" size={18} color="#666" />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Filter icon with active-filter badge */}
                    <TouchableOpacity
                      className="ml-4 p-2"
                      onPress={() => setShowFilters(true)}
                    >
                      <View>
                        <Octicons name="filter" size={26} color="#0B1626" />
                        {activeFilterCount > 0 && (
                          <View className="absolute -top-1 -right-1 bg-[#F7D57A] rounded-lg min-w-4 h-4 items-center justify-center px-1">
                            <Text className="text-[10px] font-bold text-[#0B1626]">
                              {activeFilterCount}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Exercise list — FlatList virtualizes so only visible rows are mounted */}
                <View className="flex-1 relative">
                  <TopFade height={20} style={{ zIndex: 10 }} />
                  <FlatList
                    data={filteredExercises}
                    keyExtractor={(ex) => String(ex.exercise_lib_id)}
                    className="flex-1 px-6"
                    contentContainerStyle={{
                      paddingBottom: 110,
                      paddingTop: 10,
                    }}
                    keyboardDismissMode="on-drag"
                    // extraData tells FlatList to re-check row props when selection changes
                    // without this, memoized rows won't update even when isSelected flips
                    extraData={selectedIds}
                    renderItem={({ item: ex }) => (
                      <ExerciseRow
                        ex={ex}
                        isSelected={selectedIds.has(ex.exercise_lib_id)}
                        onPress={toggleExercise}
                      />
                    )}
                    ListEmptyComponent={
                      loading ? (
                        <View className="py-10 items-center">
                          <Text className="text-[#32393d]">Loading…</Text>
                        </View>
                      ) : (
                        <View className="py-10 items-center">
                          <Text className="text-[#32393d]">
                            No exercises found.
                          </Text>
                        </View>
                      )
                    }
                  />
                  <BottomFade height={40} style={{ zIndex: 10 }} />
                </View>

                {/* Bottom buttons */}
                <View className="px-6 py-5 flex-row">
                  <TouchableOpacity
                    className="flex-1 rounded-full py-3 items-center justify-center bg-[#EFE6C8]"
                    onPress={onRestoreWorkout ?? (() => {})}
                  >
                    <Text className="text-[#0B1626] font-semibold text-s">
                      Restore Workout
                    </Text>
                  </TouchableOpacity>

                  <View className="w-4" />

                  <TouchableOpacity
                    className="flex-1 rounded-full py-2 items-center justify-center bg-[#F7D57A]"
                    onPress={handleSaveEditsPress}
                  >
                    <Text className="text-[#0B1626] font-semibold text-s">
                      Save Edits
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Public wrapper ───────────────────────────────────────────────────────────

export default function ExerciseList(props: ExerciseListProps) {
  if (!props.visible) return null;
  return (
    <ExerciseLibraryProvider>
      <ExerciseListContent {...props} />
    </ExerciseLibraryProvider>
  );
}

// ─── StyleSheet ───────────────────────────────────────────────────────
// Tiny stylesheet b/c of lack of Nativewind equivalents

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
    zIndex: 9999,
    justifyContent: "flex-end",
  },
});
