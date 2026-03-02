import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Pressable } from 'react-native';
import { Button, H1, H2, P } from "../typography";

interface EquipmentProps {
    selectedEquipments: string[];
    setSelectedEquipments: (groups: string[]) => void;
}

export default function Equipment({ selectedEquipments, setSelectedEquipments }: EquipmentProps) {
    const muscleGroups = [  // Must Change: Placeholder for equipment groups data
        { name: "Dumbbells", image: require("../../assets/images/dumbbell.png") },
        { name: "Barbell", image: require("../../assets/images/dumbbell.png") },
        { name: "Kettlebells", image: require("../../assets/images/dumbbell.png") },
        { name: "Resistance Bands", image: require("../../assets/images/dumbbell.png") },
    ]
    const { width, height } = Dimensions.get("window");
    var boxWidth = (width - 100) / 3; // 20 padding on each side and 20 gap between boxes
     if (boxWidth > 150) { // Set a max width for larger screens
        boxWidth = 150;
    }
    const cssNotSelected = `bg-[#f2f0ef] border border-[#B1B0B0] rounded-lg items-center justify-center gap-2`;
    const cssSelected = `bg-[#FCDE8C] border border-[#FCDE8C] rounded-lg items-center justify-center gap-2`;
    return (
        <View className="flex flex-row flex-wrap gap-4">
        {muscleGroups.map((group, index) => (
        <Pressable 
            className={selectedEquipments.includes(group.name) ? cssSelected : cssNotSelected}
            style={{ width: boxWidth, height: boxWidth, paddingVertical: 10}}
            key={index}
            onPress={() => {
                if (selectedEquipments.includes(group.name)) {
                    setSelectedEquipments(selectedEquipments.filter(name => name !== group.name));
                } else {
                    setSelectedEquipments([...selectedEquipments, group.name]);
                }
            }}
        >
            <Image
                className=""
                source={group.image}
                resizeMode="contain"
            />
            <P className={`w-[${boxWidth}] h-[${boxWidth}] flex-wrap text-center`}>{group.name}</P>
        </Pressable>
        ))
        }
        </View>
    )
};