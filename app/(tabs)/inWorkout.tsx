import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, TouchableOpacity, View } from "react-native";
import { Button, H1, H2, P, TextBoxInput } from '../../components/typography';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  type: string[];
}

interface WorkoutData {
  exercises: Exercise[];
  name: string;
}

export default function InWorkout() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const [workoutName, setWorkoutName] = useState("During Workout");
  const [finishedWorkout, setFinished] = useState(false);
  const [workout, setWorkout] = useState<Exercise[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [currReps, setNewReps] = useState<string[]>([]);
  const [focused, setFocus] = useState(false);

  // TO-DO: Replace with actual workout data based on workoutId
  const mockWorkoutData: WorkoutData = {
    name: "Upper Body Workout",
    exercises: [
      { name: "Bicep Curls", sets: 3, reps: "8-12", type: ["Biceps", "Arms"] },
      { name: "Push-ups", sets: 3, reps: "10-15", type: ["Chest", "Arms"] },
      { name: "Shoulder Press", sets: 3, reps: "8-10", type: ["Shoulders"] }
    ]
  };

  // TO-DO: Replace with dynamic images based on workout completion
  const myImages = new Map([
    ["present-cat", require('../../assets/images/present-cat.png')],
    ["incomplete-cat", require('../../assets/images/incomplete-cat.png')]
  ]);

  useEffect(() => {
    // TO-DO: Fetch workout data based on workoutId
    setWorkout(mockWorkoutData.exercises);
    setWorkoutName(mockWorkoutData.name);
    
    // Initialize reps array
    let initialReps: string[] = [];
    mockWorkoutData.exercises.forEach(exercise => {
      for (let j = 0; j < exercise.sets; j++) {
        initialReps.push(exercise.reps);
      }
    });
    setNewReps(initialReps);
  }, [workoutId]);

  const getTotalSets = (): number => {
    return workout.reduce((total, exercise) => total + exercise.sets, 0);
  };

  const endWorkout = () => {
    setFinished(true);
  };

  const checkFinishedState = (): boolean => {
    return getTotalSets() === checked.length;
  };

  const checking = (exercise: string) => () => {
    const newItems = checked.includes(exercise)
      ? checked.filter(item => item !== exercise)
      : [...checked, exercise];
    setChecked(newItems);
  };

  const checkCondition = (index: string): boolean => {
    return checked.includes(index);
  };

  const handlePressAdd = (exercise: Exercise) => {
    const updates = workout.map(item => {
      if (item.name === exercise.name) {
        return { ...item, sets: item.sets + 1 };
      }
      return item;
    });
    setWorkout(updates);
    
    // Add new rep entry
    const exerciseIndex = workout.findIndex(item => item.name === exercise.name);
    const insertIndex = getRepIndex(exerciseIndex) + exercise.sets;
    const newReps = [...currReps];
    newReps.splice(insertIndex, 0, exercise.reps);
    setNewReps(newReps);
  };

  const handlePressDelete = (exercise: Exercise) => {
    if (exercise.sets > 0) {
      const updates = workout.map(item => {
        if (item.name === exercise.name) {
          return { ...item, sets: item.sets - 1 };
        }
        return item;
      });
      setWorkout(updates);
      
      // Remove rep entry
      const exerciseIndex = workout.findIndex(item => item.name === exercise.name);
      const removeIndex = getRepIndex(exerciseIndex) + exercise.sets - 1;
      const newReps = [...currReps];
      newReps.splice(removeIndex, 1);
      setNewReps(newReps);
    }
  };

  const changeRep = (newRep: string, repIndex: number) => {
    const updates = [...currReps];
    updates[repIndex] = newRep;
    setNewReps(updates);
  };

  const getRepIndex = (exerciseIndex: number): number => {
    let count = 0;
    for (let i = 0; i < exerciseIndex; i++) {
      count += workout[i].sets;
    }
    return count;
  };

  const backHome = () => {
    // TO-DO: Save workout completion data
    console.log("Completed workout summary", workout);
    //router.push('/(tabs)/');
  };

  if (!workout.length) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <P>Loading workout...</P>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {!finishedWorkout ? (
        <View className="flex-1 mb-16">
          {/* Header */}
          <View className="flex-row justify-between items-center mt-10 mx-5">
            <H2 className="text-[#32393d] flex-1">{workoutName}</H2>
            <TouchableOpacity 
              className="border-2 border-[#32393d] rounded-lg px-5 py-2"
              onPress={endWorkout}
            >
              <P className="text-[#32393d] font-bold">End</P>
            </TouchableOpacity>
          </View>

          {/* Workout Content */}
          <ScrollView className="flex-1 mx-4" showsVerticalScrollIndicator={false}>
            <View className="min-h-screen/4 ml-3">
              {workout.map((item, index) => (
                <View key={`${item.name}-${index}`} className="mb-8">
                  {/* Exercise Header */}
                  <View className="flex-row justify-between items-center mb-2">
                    <H2 className="text-[#32393d] text-xl flex-1">{item.name}</H2>
                    
                    {/* Add/Remove Buttons */}
                    <View className="flex-row gap-2">
                      <TouchableOpacity 
                        className="bg-[#FFDADA] rounded-lg px-2 py-1"
                        onPress={() => handlePressAdd(item)}
                      >
                        <Feather name="plus" size={18} color="#32393d" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        className="bg-[#FFDADA] rounded-lg px-2 py-1"
                        onPress={() => handlePressDelete(item)}
                      >
                        <Feather name="minus" size={18} color="#32393d" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Divider */}
                  <View className="border-t border-[#32393d] w-full mb-2" />

                  {/* Table Header */}
                  <View className="flex-row border-b border-[#32393d] pb-2">
                    <View className="w-12">
                      <P className="text-[#32393d] font-bold text-center">Sets</P>
                    </View>
                    <View className="flex-1 border-l border-[#32393d] pl-4">
                      <P className="text-[#32393d] font-bold text-center">Reps</P>
                    </View>
                    <View className="w-24 border-l border-[#32393d]">
                      <P className="text-[#32393d] font-bold text-center">Done</P>
                    </View>
                  </View>

                  {/* Sets Rows */}
                  {Array.from({ length: item.sets }, (_, setIndex) => {
                    const repIndex = getRepIndex(index) + setIndex;
                    const checkId = `${item.name}-${setIndex + 1}`;
                    
                    return (
                      <View key={setIndex} className="flex-row items-center py-2 border-b border-[#32393d]">
                        <View className="w-12">
                          <P className="text-[#32393d] font-bold text-center">{setIndex + 1}</P>
                        </View>
                        <View className="flex-1 border-l border-[#32393d] pl-4">
                          <TextBoxInput
                            className={`h-8 text-center text-[#32393d] bg-white border ${focused ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                            value={currReps[repIndex] || ''}
                            onChangeText={(rep) => changeRep(rep, repIndex)}
                            onFocus={() => setFocus(true)}
                            onBlur={() => setFocus(false)}
                            placeholderTextColor="#999"
                          />
                        </View>
                        <View className="w-24 border-l border-[#32393d] items-center">
                          <TouchableOpacity onPress={checking(checkId)}>
                            <Feather 
                              name={checkCondition(checkId) ? "check-square" : "square"} 
                              size={24} 
                              color="#32393d"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      ) : (
        /* Workout Complete Screen */
        <View className="flex-1 justify-center items-center">
          {checkFinishedState() ? (
            <View className="justify-center items-center mt-32">
              <H1 className="text-[#DD6C6A] text-center mb-4">Workout Completed!</H1>
              <ImageBackground 
                source={myImages.get("Cat Present")} 
                className="w-full h-1/2"
                imageStyle={{ opacity: 0.8 }}
              />
            </View>
          ) : (
            <View className="justify-center items-center mt-32">
              <H1 className="text-[#3f290f] text-center mb-4">Good Progress Today</H1>
              <ImageBackground 
                source={myImages.get("incompleteCat")} 
                className="w-full h-1/2"
              />
            </View>
          )}
          
          <View className="mx-12 mt-4">
            <Button
              title="Back to home"
              onPress={backHome}
            />
          </View>
        </View>
      )}
    </View>
  );
}