import Equipment from "@/components/ui/Equipment";
import Gradient from "@/components/ui/Gradient";
import { ExerciseLibraryProvider } from "@/contexts/ExerciseLibraryContext";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import { Button, H2 } from "../../components/typography";
import BackArrow from "../../components/ui/BackArrow";
import MuscleGroups from "../../components/ui/muscleGroups";
import PopupMessage from "../../components/ui/PopupMessage";
import Sliders from "../../components/ui/Slider";

export default function GenerateWorkout() {
  const router = useRouter();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState(0);
  const [showSelectionError, setShowSelectionError] = useState(false);
  const { height } = Dimensions.get("window");

  useFocusEffect(
    useCallback(() => {
      setSelectedGroups([]);
      setSelectedEquipments([]);
      setSliderValue(0);
      setShowSelectionError(false);
    }, []),
  );

  return (
    <ExerciseLibraryProvider>
      <View
        className="flex-1 bg-[#f2f0ef] pt-20 gap-4"
        style={{ paddingBottom: height * 0.1, paddingHorizontal: 20 }}
      >
        <Gradient />
        <BackArrow page="/(tabs)/workoutList" />
        <ScrollView className="flex-1">
          <View className="gap-6">
            <View className="gap-2">
              <H2 style={{ fontFamily: "Inter_SemiBold" }}>
                Specify workout duration
              </H2>
              <Sliders value={sliderValue} onValueChange={setSliderValue} />
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
              setSliderValue(0);
            }}
            color="black"
            fontColor="white"
            fontSize={14}
          />
          <Button
            className="flex-1"
            title="Generate"
            onPress={() => {
              if (
                selectedGroups.length === 0 ||
                selectedEquipments.length === 0 ||
                sliderValue === 0
              ) {
                setShowSelectionError(true);
                return;
              }

              router.push({
                pathname: "/generatedPreview",
                params: {
                  duration: sliderValue,
                  selectedGroups: selectedGroups,
                  selectedEquipments: selectedEquipments,
                },
              });
            }}
            color="yellow"
            fontColor="black"
            fontSize={14}
          />
        </View>
      </View>

      <PopupMessage
        visible={showSelectionError}
        title="Error"
        message="Please choose at least one muscle group, one equipment option, and set time above 0 minutes."
        type="error"
        onClose={() => setShowSelectionError(false)}
      />
    </ExerciseLibraryProvider>
  );
}
