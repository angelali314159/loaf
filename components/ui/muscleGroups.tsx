import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { Button, H1, H2, P } from "../../components/typography";
export default function MuscleGroups() {
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
    return (
        <View className="flex flex-row flex-wrap gap-4">
        {muscleGroups.map((group, index) => (
        <View className={`flex w-[${boxWidth}] bg-[#f2f0ef] border border-[#B1B0B0] rounded-lg p-4 items-center gap-2`} key={index}>
            <Image
                className=""
                source={group.image}
                resizeMode="contain"
            />
            <P>{group.name}</P>
        </View>
        ))}
        </View>
    )
};