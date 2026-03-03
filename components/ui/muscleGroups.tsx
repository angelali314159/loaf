import React from "react";
import { Dimensions, Pressable, View } from "react-native";
import { useExerciseLibrary } from "../../contexts/ExerciseLibraryContext";
import { P } from "../typography";

interface MuscleGroupsProps {
  selectedGroups: string[];
  setSelectedGroups: (groups: string[]) => void;
}

export default function MuscleGroups({
  selectedGroups,
  setSelectedGroups,
}: MuscleGroupsProps) {
  const { muscleList, loading } = useExerciseLibrary();

  const { width, height } = Dimensions.get("window");
  let boxWidth = (width - 100) / 3; // 20 padding on each side and 20 gap between boxes
  if (boxWidth > 150) {
    // Set a max width for larger screens
    boxWidth = 150;
  }

  const cssNotSelected = `bg-[#f2f0ef] border border-[#B1B0B0] rounded-lg items-center justify-center gap-2 py-2`;
  const cssSelected = `bg-[#FCDE8C] border border-[#FCDE8C] rounded-lg items-center justify-center gap-2 py-2`;

  if (loading) {
    return <P>Loading muscles...</P>;
  }

  return (
    <View className="flex flex-row flex-wrap gap-4">
      {muscleList.map((muscleName, index) => (
        <Pressable
          className={
            selectedGroups.includes(muscleName) ? cssSelected : cssNotSelected
          }
          style={{ width: boxWidth, height: boxWidth }}
          key={index}
          onPress={() => {
            if (selectedGroups.includes(muscleName)) {
              setSelectedGroups(
                selectedGroups.filter((name) => name !== muscleName),
              );
            } else {
              setSelectedGroups([...selectedGroups, muscleName]);
            }
          }}
        >
          <P>{muscleName}</P>
        </Pressable>
      ))}
    </View>
  );
}
