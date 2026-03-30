import React from "react";
import { Dimensions, Image, Pressable, View } from "react-native";
import { P } from "../typography";

const muscleImages = {
  Chest: require("../../assets/images/Cats/Chest_Cat.png"),
  Back: require("../../assets/images/Cats/Back_Cat.png"),
  Shoulders: require("../../assets/images/Cats/Shoulders_Cat.png"),
  Biceps: require("../../assets/images/Cats/Biceps_Cat.png"),
  Triceps: require("../../assets/images/Cats/Triceps_Cat.png"),
  Quads: require("../../assets/images/Cats/Quads_Cat.png"),
  Hamstrings: require("../../assets/images/Cats/Hamstrings_Cat.png"),
  Glutes: require("../../assets/images/Cats/Glutes_Cat.png"),
  Abs: require("../../assets/images/Cats/Abs_Cat.png"),
  Calves: require("../../assets/images/Cats/Calves_Cat.png"),
};

interface MuscleGroupsProps {
  selectedGroups: string[];
  setSelectedGroups: (groups: string[]) => void;
}

export default function MuscleGroups({
  selectedGroups,
  setSelectedGroups,
}: MuscleGroupsProps) {
  const muscleList = [
    "Abs",
    "Chest",
    "Back",
    "Hamstrings",
    "Quads",
    "Calves",
    "Shoulders",
    "Biceps",
    "Triceps",
  ];

  const { width, height } = Dimensions.get("window");
  let boxWidth = (width - 100) / 3;
  if (boxWidth > 150) {
    boxWidth = 150;
  }

  const cssNotSelected = `bg-[#f2f0ef] border border-[#B1B0B0] rounded-lg items-center justify-center gap-2 py-2`;
  const cssSelected = `bg-[#FCDE8C] border border-[#FCDE8C] rounded-lg items-center justify-center gap-2 py-2`;

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
          {muscleImages[muscleName] && (
            <Image
              source={muscleImages[muscleName]}
              style={{ width: 40, height: 40 }}
            />
          )}
          <P>{muscleName}</P>
        </Pressable>
      ))}
    </View>
  );
}
