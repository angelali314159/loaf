import Equipment from "@/components/ui/Equipment";
import Gradient from "@/components/ui/Gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Image, Pressable, ScrollView, View } from "react-native";
import { Button, H2 } from "../../components/typography";
import MuscleGroups from "../../components/ui/MuscleGroups";
import Sliders from "../../components/ui/Slider";
import { ExerciseLibraryProvider } from "../../contexts/ExerciseLibraryContext";
import BackArrow from "../../components/ui/BackArrow.tsx";

function GenerateWorkoutContent() {
  const router = useRouter();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const { height } = Dimensions.get("window");
  const arrow = require("../../assets/images/back-arrow.png");

  return (
    <View
      className="flex-1 bg-[#f2f0ef] pt-20 gap-4"
      style={{ paddingBottom: height * 0.1, paddingHorizontal: 20 }}
    >
      <Gradient />
      <BackArrow></BackArrow>
      <ScrollView className="flex-1">
        <View className="gap-6">
          <View className="gap-2">
            <H2 style={{ fontFamily: "Inter_SemiBold" }}>
              Specify workout duration
            </H2>
            <Sliders />
          </View>
          <View className="gap-2">
            <H2 style={{ fontFamily: "Inter_SemiBold" }}>
              Muscle groups to target
            </H2>
            <MuscleGroups
              selectedGroups={selectedGroups}
              setSelectedGroups={setSelectedGroups}
            />
          </View>
          <View className="gap-2">
            <H2 style={{ fontFamily: "Inter_SemiBold" }}>Equipment</H2>
            <Equipment
              selectedEquipments={selectedEquipments}
              setSelectedEquipments={setSelectedEquipments}
            />
          </View>
        </View>
      </ScrollView>
      <View className="flex-row justify-between gap-4 w-full">
        <Button
          className="flex-1"
          title="Clear All"
          onPress={() => {
            setSelectedGroups([]);
            setSelectedEquipments([]);
          }}
          color="black"
          fontColor="white"
          fontSize={14}
        />
        <Button
          className="flex-1"
          title="Generate"
          onPress={() => {
            console.log(
              "Selected Groups: ",
              selectedGroups,
              "Selected Equipments: ",
              selectedEquipments,
            );
          }}
          color="yellow"
          fontColor="black"
          fontSize={14}
        />
      </View>
    </View>
  );
}

export default function generateWorkout() {
  return (
    <ExerciseLibraryProvider>
      <GenerateWorkoutContent />
    </ExerciseLibraryProvider>
  );
}
