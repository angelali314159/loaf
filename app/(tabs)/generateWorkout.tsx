import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Button, H1, H2, P } from "../../components/typography";
import Sliders from '../../components/ui/Slider';
import MuscleGroups from '@/components/ui/muscleGroups';

const { height } = Dimensions.get("window");

export default function GenerateWorkout() {
    return (
        <View className="flex-1 bg-[#f2f0ef]" style={{ paddingBottom: height * 0.15, paddingHorizontal: 20 }}>
            <H2>Specify workout duration</H2>
            <Sliders />
            <H2>Muscle groups to target</H2>
            <MuscleGroups />
            <H2>Equipement</H2>

            <View className="flex-row justify-between gap-4 w-full">
                <Button className="flex-1" title="Clear All" onPress={() => {}} color="black" fontColor="white" fontSize={14} />
                <Button className="flex-1" title="Generate" onPress={() => {}} color="yellow" fontColor="black" fontSize={14} />
            </View>
        </View>
    )
};