import { AntDesign, Fontisto } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, TouchableOpacity, View } from "react-native";
import { H2, P } from '../../components/typography';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  type: string[];
}

export default function AllExercises() {
  const { exerciseType = 'Biceps', workout = '[]' } = useLocalSearchParams<{ 
    exerciseType: string; 
    workout?: string; 
  }>();
  
  const [workoutSpecific, setWorkoutSpecific] = useState<Exercise[]>([]);
  const [checkedWorkout, setCheckedWorkout] = useState<Exercise[]>([]);
  const [count, setCount] = useState(0);
  const [exerciseData, setData] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // TO-DO: Replace with dynamic images based on exercise names from API
  const myImages = new Map([
    ["Russian Twists", require('../../assets/images/exercises/russianTwists.jpg')],
    ["Side Planks", require('../../assets/images/exercises/sidePlanks.jpg')],
    ["Sit Ups", require('../../assets/images/exercises/sitUps.jpg')],
    ["Leg Raises", require('../../assets/images/exercises/legRaises.jpg')],
    ["Shoulder Press", require('../../assets/images/exercises/shoulderPress.jpg')],
    // TO-DO: Add more exercise images as needed
  ]);

  // Mock data - TO-DO: Replace with actual API call
  const mockExerciseData: Exercise[] = [
    { name: "Russian Twists", sets: 3, reps: "10-15", type: ["Abs"] },
    { name: "Side Planks", sets: 3, reps: "8-10", type: ["Abs"] },
  ];

  useEffect(() => {
    // TO-DO: Replace with actual API call
    // async function getExercises() {
    //   const response = await fetch(`http://localhost:5050/record/exercises/type/${exerciseType}`);
    //   const data = await response.json();
    //   return data;
    // }
    
    // Simulate API loading
    setTimeout(() => {
      setData(mockExerciseData);
      setIsLoading(false);
    }, 2000);

    // Parse existing workout if provided
    try {
      const parsedWorkout = JSON.parse(workout);
      setCheckedWorkout(parsedWorkout);
    } catch {
      setCheckedWorkout([]);
    }
  }, [exerciseType, workout]);

  const handleBookmarkPress = (exercise: Exercise) => {
    let updateChecked = [...checkedWorkout];
    let updateSpecific = [...workoutSpecific];
    
    const existingIndex = updateChecked.findIndex(item => item.name === exercise.name);
    const specificIndex = updateSpecific.findIndex(item => item.name === exercise.name);
    
    if (existingIndex !== -1) {
      updateChecked.splice(existingIndex, 1);
      console.log("removing exercise");
    } else {
      updateChecked.push(exercise);
      console.log("adding exercise");
    }
    
    if (specificIndex !== -1) {
      updateSpecific.splice(specificIndex, 1);
      setCount(count - 1);
    } else {
      updateSpecific.push(exercise);
      setCount(count + 1);
    }
    
    setCheckedWorkout(updateChecked);
    setWorkoutSpecific(updateSpecific);
  };

  const handleArrowPress = (exerciseName: string) => {
    console.log("Navigating to exercise:", exerciseName);
    router.push({
      pathname: '/(tabs)/exercisePreview',
      params: { exerciseName }
    });
  };

  const handleAddToWorkout = () => {
    // TO-DO: Navigate to add workout screen or save workout
    console.log("Adding exercises to workout:", checkedWorkout);
    /*router.push({
      pathname: '/(tabs)/addWorkout',
      params: { selectedExercises: JSON.stringify(checkedWorkout) }
    });*/
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <P className="text-[#7a6fbd] text-2xl text-center mb-4">Fetching...</P>
        <ImageBackground 
          source={require('../../assets/images/cat-loading.png')} 
          className="w-1/2 h-1/4"
          imageStyle={{ opacity: 0.7 }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white mb-16">
      {/* Header */}
      <TouchableOpacity 
        onPress={() => router.back()}
        className="absolute top-5 left-5 z-10 p-2"
      >
        <AntDesign name="arrowleft" size={30} color="black" />
      </TouchableOpacity>

      <View className="mt-16 mx-4 mb-4">
        <H2 className="text-[#32393d] text-3xl font-bold ml-10">{exerciseType} Exercises</H2>
      </View>

      {/* Exercise List */}
      <ScrollView className="flex-1 mx-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap">
          {exerciseData.map((item, index) => (
            <View key={`${item.name}-${index}`} className="w-full mb-4">
              <ImageBackground 
                source={myImages.get(item.name) || require('../../assets/images/exercises/sidePlanks.jpg')}
                className="w-full h-48 rounded-2xl overflow-hidden bg-[#656467]"
                imageStyle={{ borderRadius: 20, opacity: 0.3 }}
              >
                {/* Exercise Info Overlay */}
                <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-5 rounded-b-2xl">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <P className="text-white font-bold text-lg mb-2">{item.name}</P>
                      <View className="flex-row gap-2">
                        <View className="bg-black/50 px-3 py-1 rounded-2xl">
                          <P className="text-white text-sm">Sets: {item.sets}</P>
                        </View>
                        <View className="bg-black/50 px-3 py-1 rounded-2xl">
                          <P className="text-white text-sm">Reps: {item.reps}</P>
                        </View>
                      </View>
                    </View>
                    
                    {/* Arrow Button */}
                    <TouchableOpacity 
                      onPress={() => handleArrowPress(item.name)}
                      className="p-2"
                    >
                      <AntDesign name="arrowright" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Bookmark Button */}
                <TouchableOpacity 
                  onPress={() => handleBookmarkPress(item)}
                  className="absolute top-4 right-5 p-2"
                >
                  <Fontisto 
                    name={checkedWorkout.find(instance => instance.name === item.name) ? "bookmark-alt" : "bookmark"} 
                    size={24} 
                    color="white" 
                  />
                </TouchableOpacity>
              </ImageBackground>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      {count > 0 && (
        <View className="absolute bottom-8 left-0 right-0 bg-black/50 mx-16 rounded-2xl flex-row justify-between items-center px-5 py-3">
          <P className="text-white text-base">{count} Exercises Selected</P>
          <TouchableOpacity 
            onPress={handleAddToWorkout}
            className="bg-[#333333] px-4 py-2 rounded-lg"
          >
            <P className="text-[#cacaca] text-sm">Add</P>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}