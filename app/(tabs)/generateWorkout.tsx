import Equipment from "@/components/ui/Equipment";
import Gradient from "@/components/ui/Gradient";
import MuscleGroups from "../../components/ui/MuscleGroups";
import { ExerciseLibraryProvider } from "@/contexts/ExerciseLibraryContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import { Button, H2 } from "../../components/typography";
import BackArrow from "../../components/ui/BackArrow";
import PopupMessage from "../../components/ui/PopupMessage";
import Sliders from "../../components/ui/Slider";

export default function GenerateWorkout() {
    const router = useRouter();
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
    const { height } = Dimensions.get("window");
    const arrow = require('../../assets/images/back-arrow.png');

    return (
        <View className="flex-1 bg-[#f2f0ef] pt-20 gap-4" style={{ paddingBottom: height * 0.10, paddingHorizontal: 20 }}>
        <Gradient />
        <Pressable onPress={() => router.navigate('/workoutList')}>
        <Image
            className=""
            source={arrow}
            resizeMode="contain"
        />
        </Pressable>
        <ScrollView className="flex-1">
            <View className="gap-6">
                <View className="gap-2">
                    <H2 style={{ fontFamily: 'Inter_SemiBold' }}>Specify workout duration</H2>
                    <Sliders />
                </View>
                <View className="gap-2">
                    <H2 style={{ fontFamily: 'Inter_SemiBold' }}>Muscle groups to target</H2>
                    <MuscleGroups selectedGroups={selectedGroups} setSelectedGroups={setSelectedGroups} />
                </View>
                <View className="gap-2">
                    <H2 style={{ fontFamily: 'Inter_SemiBold' }}>Equipment</H2>
                    <Equipment selectedEquipments={selectedEquipments} setSelectedEquipments={setSelectedEquipments} />
                </View>
            </View>
        </ScrollView>
        <View className="flex-row justify-between gap-4 w-full">
            <Button className="flex-1" title="Clear All" onPress={() => {setSelectedGroups([]); setSelectedEquipments([]);}} color="black" fontColor="white" fontSize={14} />
            <Button className="flex-1" title="Generate" onPress={() => {console.log("Selected Groups: ", selectedGroups, "Selected Equipments: ", selectedEquipments);}} color="yellow" fontColor="black" fontSize={14} />
        </View>
        </View>
    )
};