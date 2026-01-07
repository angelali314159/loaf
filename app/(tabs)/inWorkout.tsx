import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { Button, H3, H4, P } from '../../components/typography';

interface SetData {
  reps: string;
  lbs: string;
  checked: boolean;
}

interface ExerciseData {
  name: string;
  sets: SetData[];
}

function getTodayDateStr() {
  const d = new Date();
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// TODO: REPLACE WITH ACTUAL WORKOUT DATA
const dummyExercises: ExerciseData[] = [
  {
    name: "Bicep Curls",
    sets: [
      { reps: "10", lbs: "15", checked: false },
      { reps: "8", lbs: "15", checked: false },
    ],
  },
  {
    name: "Push-ups",
    sets: [
      { reps: "12", lbs: "0", checked: false },
      { reps: "10", lbs: "0", checked: false },
    ],
  },
];

export default function InWorkout() {
  // Timer state
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Exercises state
  const [exercises, setExercises] = useState<ExerciseData[]>(dummyExercises);

  // Stats
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalLbs = exercises.reduce((sum, ex) => 
    sum + ex.sets.reduce((s, set) => 
      s + (Number(set.reps || 0) * Number(set.lbs || 0)), 0
    ), 0
  );

  // Timer effect
  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Handlers
  const handleCheckSet = (exIdx: number, setIdx: number) => {
    setExercises(prev =>
      prev.map((ex, i) =>
        i === exIdx
          ? {
              ...ex,
              sets: ex.sets.map((set, j) =>
                j === setIdx ? { ...set, checked: !set.checked } : set
              ),
            }
          : ex
      )
    );
  };

  const handleChangeSet = (exIdx: number, setIdx: number, field: 'reps' | 'lbs', value: string) => {
    setExercises(prev =>
      prev.map((ex, i) =>
        i === exIdx
          ? {
              ...ex,
              sets: ex.sets.map((set, j) =>
                j === setIdx ? { ...set, [field]: value } : set
              ),
            }
          : ex
      )
    );
  };

  const handleAddSet = (exIdx: number) => {
    setExercises(prev =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: [...ex.sets, { reps: "", lbs: "", checked: false }] }
          : ex
      )
    );
  };

  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    setExercises(prev =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) }
          : ex
      )
    );
  };

  const handleAddExercise = () => {
    setExercises(prev => [
      ...prev,
      { name: `Exercise ${prev.length + 1}`, sets: [{ reps: "", lbs: "", checked: false }] },
    ]);
  };

  const handleFinishWorkout = () => {
    //TODO:
    // Placeholder for finish logic
    // e.g., save to server, navigate, etc.
  };

  return (
    <View className="flex-1 bg-white">
      {/* SEMICIRCLE GRADIENT BACKGROUND */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 0 }}>
        <Svg height={Dimensions.get('screen').height * .5} width={Dimensions.get('screen').width}>
          <Defs>
            <RadialGradient
              id="topSemiCircle"
              cx="50%" //centered horizontally
              cy="0%" //top edge
              rx="150%" //horiztonal radius
              ry="70%" //vertical radius
              gradientUnits="objectBoundingBox"
            >
              <Stop offset="0%" stopColor="#FCDE8C" stopOpacity={.9} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={.1} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#topSemiCircle)" />
        </Svg>
      </View>
        
      {/* Top Section: Header */}
      <View className="px-6 pt-10 pb-6 mt-15 ml-25 mr-25">
        <H3 baseSize={20} className="mb-4">{getTodayDateStr()} Workout</H3>
        {/* Stats Row */}
        <View className="flex-row items-stretch mb-4 mt-5">
          {/* Duration */}
          <View className="flex-1 items-center">
            <H4>Duration</H4>
            <H4 className="mt-2">{formatTime(seconds)}</H4>
          </View>
          <View className="w-px bg-[#B1B0B0] mx-2" />
          {/* Lbs */}
          <View className="flex-1 items-center">
            <H4 className="mt-1">lbs</H4>
            <H4 className="mt-2">{totalLbs}</H4>
          </View>
          <View className="w-px bg-[#B1B0B0] mx-2" />
          {/* Sets */}
          <View className="flex-1 items-center">
            <H4 className="mt-1">Sets</H4>
            <H4 className="mt-2">{totalSets}</H4>
          </View>
        </View>

        {/* Buttons Row */}
        <View className="flex-row gap-4 mt-5">
          <Button
            title="Add Exercise"
            color="yellow"
            fontColor="blue"
            height={35}
            fontSize={12}
            style={{ flex: 1, marginVertical: 0 }}
            onPress={handleAddExercise}
          />
          <Button
            title="Finish workout"
            color="blue"
            fontColor="yellow"
            height={35}
            fontSize={12}
            style={{ flex: 1, marginVertical: 0 }}
            onPress={handleFinishWorkout}
          />
        </View>
      </View>


      {/* Bottom Section: Exercises - SCROLLABLE */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={true}>
        {exercises.map((exercise, exIdx) => (
          <View key={exIdx} className="mb-8">
            <H4 baseSize={16}className="mb-3">{exercise.name}</H4>
            {/* Table Header */}
            <View className="flex-row pb-2 mb-1">
              <View className="w-10"><P className="text-center">Set</P></View>
              <View className="flex-1 pl-2"><P className="text-center">Reps</P></View>
              <View className="flex-1 pl-2"><P className="text-center">Ibs</P></View>
              <View className="w-12"/>
              <View className="w-10" />
            </View>
            {/* Sets Rows */}
            {exercise.sets.map((set, setIdx) => (
              <View key={setIdx} className="flex-row items-center py-2">
                <View className="w-10"><P className="text-center">{setIdx + 1}</P></View>
                <View className="flex-1 pl-2">
                  <TextInput
                    className="h-8 text-center text-[#565656]"
                    style={{ fontFamily: 'Inter_Regular' }}
                    value={set.reps}
                    onChangeText={v => handleChangeSet(exIdx, setIdx, 'reps', v)}
                    placeholder="-"
                    placeholderTextColor="#999"
                    keyboardType="numeric" //only numeric input
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View className="flex-1 pl-2">
                  <TextInput
                    className="h-8 text-center text-[#565656]"
                    style={{ fontFamily: 'Inter_Regular' }}
                    value={set.lbs}
                    onChangeText={v => handleChangeSet(exIdx, setIdx, 'lbs', v)}
                    placeholder="-"
                    placeholderTextColor="#999"
                    keyboardType="numeric" //only numeric input
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View className="w-12 items-center">
                  <TouchableOpacity onPress={() => handleCheckSet(exIdx, setIdx)}>
                    <Feather
                      name={set.checked ? "check-square" : "square"}
                      size={24}
                      color="#32393d"
                    />
                  </TouchableOpacity>
                </View>
                <View className="w-10 items-center">
                  <TouchableOpacity onPress={() => handleRemoveSet(exIdx, setIdx)}>
                    <Feather name="minus" size={20} color="#DD6C6A" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {/* Add Set Button */}
            <View className="flex-row mt-2">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => handleAddSet(exIdx)}
              >
                <Feather name="plus" size={20} color="#32393d" />
                <P className="ml-1 text-[#32393d]">Add Set</P>
              </TouchableOpacity>
            </View>
            <View className="h-px bg-[#DADADA] mt-4" />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}