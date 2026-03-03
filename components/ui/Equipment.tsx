import { useExerciseLibrary } from "@/contexts/ExerciseLibraryContext";
import React from "react";
import { Dimensions, Image, Pressable, View } from "react-native";
import { P } from "../typography";

interface EquipmentProps {
  selectedEquipments: string[];
  setSelectedEquipments: (groups: string[]) => void;
}

export default function Equipment({
  selectedEquipments,
  setSelectedEquipments,
}: EquipmentProps) {
  const { equipmentList, loading } = useExerciseLibrary();

  const { width } = Dimensions.get("window");
  let boxWidth = (width - 100) / 3; // 20 padding on each side and 20 gap between boxes
  if (boxWidth > 150) {
    // Set a max width for larger screens
    boxWidth = 150;
  }

  const cssNotSelected = `bg-[#f2f0ef] border border-[#B1B0B0] rounded-lg items-center justify-center gap-2`;
  const cssSelected = `bg-[#FCDE8C] border border-[#FCDE8C] rounded-lg items-center justify-center gap-2`;

  if (loading) {
    return <P>Loading equipment...</P>;
  }

  return (
    <View className="flex flex-row flex-wrap gap-4">
      {equipmentList.map((equipment, index) => (
        <Pressable
          className={
            selectedEquipments.includes(equipment)
              ? cssSelected
              : cssNotSelected
          }
          style={{ width: boxWidth, height: boxWidth, paddingVertical: 10 }}
          key={index}
          onPress={() => {
            if (selectedEquipments.includes(equipment)) {
              setSelectedEquipments(
                selectedEquipments.filter((name) => name !== equipment),
              );
            } else {
              setSelectedEquipments([...selectedEquipments, equipment]);
            }
          }}
        >
          <Image className="" source={equipment.image} resizeMode="contain" />
          <P
            className={`w-[${boxWidth}] h-[${boxWidth}] flex-wrap text-center`}
          >
            {equipment}
          </P>
        </Pressable>
      ))}
    </View>
  );
}
