import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Pressable } from 'react-native';
import { Button, H1, H2, P } from "../typography";

interface MuscleGroupsProps {
    selectedGroups: string[];
    setSelectedGroups: (groups: string[]) => void;
}

export default function MuscleGroups({ selectedGroups, setSelectedGroups }: MuscleGroupsProps) {
    const muscleGroups = [  // Must Change: Placeholder for muscle groups data
        { name: "Abs", image: require("../../assets/images/cat_abs.svg") },
        { name: "Biceps", image: require("../../assets/images/cat_abs.svg") },
        { name: "Triceps", image: require("../../assets/images/cat_abs.svg") },
        { name: "Chest", image: require("../../assets/images/cat_abs.svg") },
    ]
    const { width, height } = Dimensions.get("window");
    var boxWidth = (width - 100) / 3; // 20 padding on each side and 20 gap between boxes
     if (boxWidth > 150) { // Set a max width for larger screens
        boxWidth = 150;
    }
    console.log(width);
    console.log(boxWidth);
    //const cssNotSelected = `flex w-[${boxWidth}] h-[${boxWidth}] bg-[#f2f0ef] border border-[#B1B0B0] rounded-lg px-4 py-2 items-center justify-center gap-2`;
    //const cssSelected = `flex w-[${boxWidth}]  h-[${boxWidth}] bg-[#FCDE8C] border border-[#FCDE8C] rounded-lg px-4 py-2 items-center justify-center gap-2`;
    const cssNotSelected = `bg-[#f2f0ef] border border-[#B1B0B0] rounded-lg items-center justify-center gap-2 py-2`;
    const cssSelected = `bg-[#FCDE8C] border border-[#FCDE8C] rounded-lg items-center justify-center gap-2 py-2`;
    return (
        <View className="flex flex-row flex-wrap gap-4">
        {muscleGroups.map((group, index) => (
        <Pressable 
            className={selectedGroups.includes(group.name) ? cssSelected : cssNotSelected} 
            style={{ width: boxWidth, height: boxWidth }}
            key={index}
            onPress={() => {
                if (selectedGroups.includes(group.name)) {
                    setSelectedGroups(selectedGroups.filter(name => name !== group.name));
                } else {
                    setSelectedGroups([...selectedGroups, group.name]);
                }
            }}
        >
            <Image
                className=""
                source={group.image}
                resizeMode="contain"
            />
            <P>{group.name}</P>
        </Pressable>
        ))
        }
        </View>
    )
};