import { Feather } from "@expo/vector-icons";
import Octicons from "@expo/vector-icons/Octicons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  FlatList,
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

// ─── Emoji lookup maps (cosmetic only — options still come from the DB) ────────

const EQUIPMENT_EMOJI: Record<string, string> = {
  dumbbell: "🏋️",
  barbell: "🏋️‍♂️",
  kettlebell: "🔔",
  machine: "⚙️",
  cable: "🔗",
  plates: "🪨",
  bands: "〰️",
  mat: "🟦",
  "body weight": "🧍",
  bodyweight: "🧍",
  none: "✕",
};

const MUSCLE_EMOJI: Record<string, string> = {
  chest: "🫁",
  back: "🔙",
  shoulders: "💪",
  biceps: "💪",
  triceps: "💪",
  forearms: "🦾",
  core: "🔥",
  glutes: "🍑",
  quads: "🦵",
  hamstrings: "🦵",
  calves: "🦿",
  traps: "🏔️",
  lats: "🪽",
};

// ─── Derived filter option type ───────────────────────────────────────────────

interface FilterOption {
  label: string; // Display name (DB casing)
  value: string; // Normalized lowercase key used for Set membership
  emoji: string;
}

// ─── Animated Filter Tile ─────────────────────────────────────────────────────

interface AnimatedFilterTileProps {
  label: string;
  emoji: string;
  active: boolean;
  onPress: () => void;
}

function AnimatedFilterTile({
  label,
  emoji,
  active,
  onPress,
}: AnimatedFilterTileProps) {
  const anim = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: active ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // color interpolation requires JS driver
    }).start();
  }, [active]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFFFFF", "#F7D57A"],
  });
  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E5E7EB", "#F7D57A"],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="w-[30%]"
    >
      {/* Animated colors + non-standard borderWidth must stay inline */}
      <Animated.View
        className="aspect-square rounded-2xl items-center justify-center p-2"
        style={{ backgroundColor, borderColor, borderWidth: 1.5 }}
      >
        <Text className="text-3xl mb-1">{emoji}</Text>
        <Text
          className={`text-xs text-center ${
            active ? "text-[#0B1626] font-bold" : "text-[#4B5563] font-medium"
          }`}
          numberOfLines={2}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

interface FilterPanelProps {
  equipmentOptions: FilterOption[];
  muscleOptions: FilterOption[];
  selectedEquipment: Set<string>;
  selectedMuscles: Set<string>;
  onToggleEquipment: (v: string) => void;
  onToggleMuscle: (v: string) => void;
  onBack: () => void;
  onClear: () => void;
}

function FilterPanel({
  equipmentOptions,
  muscleOptions,
  selectedEquipment,
  selectedMuscles,
  onToggleEquipment,
  onToggleMuscle,
  onBack,
  onClear,
}: FilterPanelProps) {
  const activeCount = selectedEquipment.size + selectedMuscles.size;

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
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Equipment section — only rendered when data has loaded */}
        {equipmentOptions.length > 0 && (
          <>
            <Text className="text-[#0B1626] text-2xl font-bold mb-4">
              Equipment
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {equipmentOptions.map((opt) => (
                <AnimatedFilterTile
                  key={opt.value}
                  label={opt.label}
                  emoji={opt.emoji}
                  active={selectedEquipment.has(opt.value)}
                  onPress={() => onToggleEquipment(opt.value)}
                />
              ))}
            </View>
          </>
        )}

        {/* Muscles section — only rendered when data has loaded */}
        {muscleOptions.length > 0 && (
          <>
            <Text className="text-[#0B1626] text-2xl font-bold mt-6 mb-4">
              Target Muscles
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {muscleOptions.map((opt) => (
                <AnimatedFilterTile
                  key={opt.value}
                  label={opt.label}
                  emoji={opt.emoji}
                  active={selectedMuscles.has(opt.value)}
                  onPress={() => onToggleMuscle(opt.value)}
                />
              ))}
            </View>
          </>
        )}

        {/* Show a placeholder while context is still fetching */}
        {equipmentOptions.length === 0 && muscleOptions.length === 0 && (
          <View className="py-10 items-center">
            <Text className="text-[#6B7280]">Loading filters…</Text>
          </View>
        )}
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
        className={`flex-row items-center rounded-2xl px-4 py-4 ${
          isSelected ? "bg-[#F7D57A]" : "bg-transparent"
        }`}
      >
        <View className="w-16 h-16 rounded-full bg-[#DADDE3] items-center justify-center overflow-hidden">
          <Text className="text-[#32393d] font-bold">{getAvatar(ex.name)}</Text>
        </View>
        <View className="flex-1 ml-4">
          <Text className="text-[#0B1626] text-xl font-semibold">
            {ex.name}
          </Text>
          <Text className="text-[#6B7280] text-base mt-1">
            {getSubtitle(ex)}
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
  const { exercises, exercisesByMuscle, loading } = useExerciseLibrary();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedEquipment, setSelectedEquipment] = React.useState<Set<string>>(
    new Set(),
  );
  const [selectedMuscles, setSelectedMuscles] = React.useState<Set<string>>(
    new Set(),
  );

  // ── Derive equipment options from real DB data ──────────────────────────────
  const equipmentOptions = useMemo<FilterOption[]>(() => {
    const seen = new Set<string>();
    const opts: FilterOption[] = [];
    let hasNone = false;

    for (const ex of exercises) {
      if (!ex.equipment) {
        hasNone = true;
      } else {
        const value = ex.equipment.trim().toLowerCase();
        if (value && !seen.has(value)) {
          seen.add(value);
          opts.push({
            label: ex.equipment.trim(),
            value,
            emoji: EQUIPMENT_EMOJI[value] ?? "🏋️",
          });
        }
      }
    }

    // Sort alphabetically, then append None at the end
    opts.sort((a, b) => a.label.localeCompare(b.label));
    if (hasNone) {
      opts.push({ label: "None", value: "none", emoji: "✕" });
    }

    return opts;
  }, [exercises]);

  // ── Derive muscle options from exercisesByMuscle keys ─────────────────────
  const muscleOptions = useMemo<FilterOption[]>(() => {
    return Object.keys(exercisesByMuscle)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => {
        const value = name.trim().toLowerCase();
        return {
          label: name.trim(),
          value,
          emoji: MUSCLE_EMOJI[value] ?? "💪",
        };
      });
  }, [exercisesByMuscle]);

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
    if (selectedEquipment.size > 0) {
      result = result.filter((ex) => {
        if (!ex.equipment) {
          // Matches exercises with no equipment if "none" is selected
          return selectedEquipment.has("none");
        }
        const value = ex.equipment.trim().toLowerCase();
        return selectedEquipment.has(value);
      });
    }

    // Muscle filter — uses the proper muscles array from ExerciseLibraryItem
    if (selectedMuscles.size > 0) {
      result = result.filter((ex) =>
        (ex.muscles ?? []).some((m) =>
          selectedMuscles.has(m.name.trim().toLowerCase()),
        ),
      );
    }

    return result;
  }, [exercises, searchQuery, selectedEquipment, selectedMuscles]);

  // ── Toggle helpers ────────────────────────────────────────────────────────────
  const toggleSet = (
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    value: string,
  ) => {
    setter((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  const clearFilters = useCallback(() => {
    setSelectedEquipment(new Set());
    setSelectedMuscles(new Set());
  }, []);

  const activeFilterCount = selectedEquipment.size + selectedMuscles.size;

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
                  equipmentOptions={equipmentOptions}
                  muscleOptions={muscleOptions}
                  selectedEquipment={selectedEquipment}
                  selectedMuscles={selectedMuscles}
                  onToggleEquipment={(v) => toggleSet(setSelectedEquipment, v)}
                  onToggleMuscle={(v) => toggleSet(setSelectedMuscles, v)}
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
                    onPress={onSaveEdits ?? (() => {})}
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
