import { BlurView } from 'expo-blur';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { H1, H2, P } from '../../components/typography';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  type: string[];
  time?: number;
}

interface WorkoutPlan {
  name: string;
  exercises: string[];
}

const generateWeek = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize time

  const dayOfWeek = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);

  const week = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(sunday);
    currentDate.setDate(sunday.getDate() + i);
    currentDate.setHours(0, 0, 0, 0);

    const isToday = currentDate.getTime() === today.getTime();
    const isPast = currentDate < today;
    const isFuture = currentDate > today;

    week.push({
      dateObj: currentDate,
      dayName: currentDate.toLocaleDateString("en-US", { weekday: "short" }),
      monthDay: currentDate.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
      }),
      isToday,
      isPast,
      isFuture,
    });
  }

  return week;
};


export default function LandingMain() {
  const { username = 'Joooy' } = useLocalSearchParams<{ username?: string }>();
  const [savedExercises, setSavedExercises] = useState<WorkoutPlan[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);

  //Week Generated
  const week = useMemo(() => generateWeek(), []);

  const mockWorkoutPlans: WorkoutPlan[] = [
    { name: "Upper Body Blast", exercises: ["Bicep Curls", "Push-ups", "Shoulder Press"] },
    { name: "Leg Day", exercises: ["Squats", "Lunges", "Calf Raises"] },
    { name: "Core Focus", exercises: ["Planks", "Russian Twists", "Leg Raises"] }
  ];

  useEffect(() => {
    setSavedExercises(mockWorkoutPlans);
    setWorkoutPlans(mockWorkoutPlans);
  }, [username]);

  const navigateToWorkout = (workoutPlan: WorkoutPlan) => {
    router.push({
      pathname: '/(tabs)/inWorkout',
      params: { workoutId: workoutPlan.name }
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <BlurView
        intensity={30}
        style={{
          width: 479.338,
          height: 119.909,
          position: 'absolute',
          left: -50,
          top: -90,
          borderRadius: 479.338,
          backgroundColor: '#FFFEFE',
        }}
      />

      <View className="flex-1 bg-white">
        <ScrollView className="flex-1 mx-4">

          {/* Semicircle Gradient Background */}
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 0 }}>
            <Svg
              height={Dimensions.get('screen').height * .5}
              width={Dimensions.get('screen').width}
            >
              <Defs>
                <RadialGradient
                  id="topSemiCircle"
                  cx="50%"
                  cy="0%"
                  rx="120%"
                  ry="70%"
                  gradientUnits="objectBoundingBox"
                >
                  <Stop offset="0%" stopColor="#FCDE8C" stopOpacity={0.9} />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.1} />
                </RadialGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#topSemiCircle)" />
            </Svg>
          </View>

          {/* Header */}
          <View className="mt-32 mb-4 flex-row items-center justify-between px-4">
            <Image
              source={require('../../assets/images/profile-pic.png')}
              style={{ height: 48, width: 48, borderRadius: 24 }}
              resizeMode="cover"
            />

            <View className="flex-1 ml-3">
              <H2 baseSize={15}>Hello {username}</H2>
              <H1 baseSize={15}>Are you ready for your workout?</H1>
            </View>

            <Image
              source={require('../../assets/images/bell.png')}
              style={{ height: 24, width: 24 }}
              resizeMode="contain"
            />
          </View>

          {/* Week Section */}
          <View className="flex-row justify-between px-4 mb-6">
            {week.map((day, index) => (
              <View
                key={index}
                className="items-center px-2 py-3 rounded-3xl"
                style={{
                  backgroundColor: day.isToday ? "#FCDE8C" : "transparent",
                  minWidth: 48,
                }}
              >
                <Text style={{ fontWeight: "600", color: "#32393d" }}>
                  {day.dayName}
                </Text>

                <Text style={{ color: "#32393d", marginTop: 4 }}>
                  {day.monthDay}
                </Text>

                <View style={{ marginTop: 6 }}>
                  {day.isPast || day.isToday ? (
                    // Checkmark
                    <Text style={{ fontSize: 14, fontWeight: "700" }}>✓</Text>
                  ) : (
                    //Open circle
                    <View
                      style={{
                        height: 12,
                        width: 12,
                        borderRadius: 6,
                        borderWidth: 1.5,
                        borderColor: "#32393d",
                      }}
                    />
                  )}
                </View>
              </View>
            ))}
          </View>


          {/* Workouts Section */}
          <View className="mb-6">
            <H1 baseSize={16}>Planned Workouts</H1>

            {workoutPlans.map((plan, index) => (
              <TouchableOpacity
                key={index}
                className="bg-white p-4 mb-3 shadow-sm"
                onPress={() => navigateToWorkout(plan)}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <P className="text-[#32393d] font-semibold text-lg">
                      {plan.name}
                    </P>
                    <P className="text-[#32393d] opacity-70 mt-1">
                      {plan.exercises.join(', ')}
                    </P>
                  </View>

                  <Pressable className="w-20 py-2 rounded-2xl bg-[#FCDE8C] items-center">
                    <Text className="text-black font-bold tracking-wider">
                      Start
                    </Text>
                  </Pressable>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Explore Exercise Section */}
          <View className="mb-6 flex-row items-center justify-between">
          <H1 baseSize={13}>
            Explore Exercise Categories
          </H1>

          <Text
            style={{ color: "#FAB906", fontSize: 10}}
            className="font-bold tracking-wider"
          >
            View More
          </Text>

          
        </View>

        <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  className="mb-6"
>
  <View className="flex-row px-4">

    {/* Abs */}
    <View
      className="mr-6 items-center justify-between"
      style={{ width: 150, height: 190 }}
    >
      <Image
        source={require('../../assets/images/Cats/Abs_Cat.png')}
        style={{ height: 150, width: 150, marginTop: 3.5, marginRight: 40, marginLeft: 30 }}
        resizeMode="contain"
      />
      <Text className="text-center font-semibold text-[#32393d]">
        Abs
      </Text>
    </View>

    {/* Back */}
    <View
      className="mr-6 items-center justify-between"
      style={{ width: 150, height: 190 }}
    >
      <Image
        source={require('../../assets/images/Cats/Back_Cat.png')}
        style={{ height: 150, width: 150 }}
        resizeMode="contain"
      />
      <Text className="text-center font-semibold text-[#32393d]">
        Back
      </Text>
    </View>

    {/* Chest */}
    <View
      className="mr-6 items-center justify-between"
      style={{ width: 150, height: 190 }}
    >
      <Image
        source={require('../../assets/images/Cats/Chest_Cat.png')}
        style={{ height: 150, width: 150, marginTop: -7 }}
        resizeMode="contain"
      />
      <Text className="text-center font-semibold text-[#32393d]">
        Chest
      </Text>
    </View>

    {/* Stretching */}
    <View
      className="mr-6 items-center justify-between"
      style={{ width: 150, height: 190 }}
    >
      <Image
        source={require('../../assets/images/Cats/Stretching_Cat.png')}
        style={{ height: 150, width: 150, marginTop: 1.5 }}
        resizeMode="contain"
      />
      <Text className="text-center font-semibold text-[#32393d]">
        Stretching
      </Text>
    </View>

    {/* Arms */}
    <View
      className="mr-6 items-center justify-between"
      style={{ width: 150, height: 190, marginTop: -7}}
    >
      <Image
        source={require('../../assets/images/Cats/Arms_Cat.png')}
        style={{ height: 150, width: 150 }}
        resizeMode="contain"
      />
      <Text className="text-center font-semibold text-[#32393d] mt-8">
        Arms
      </Text>
    </View>

    {/* Glutes */}
    <View
      className="mr-6 items-center justify-between"
      style={{ width: 150, height: 190, marginTop: 5}}
    >
      <Image
        source={require('../../assets/images/Cats/Glutes_Cat.png')}
        style={{ height: 150, width: 150 }}
        resizeMode="contain"
      />
      <Text className="text-center font-semibold text-[#32393d]">
        Glutes
      </Text>
    </View>

  </View>
</ScrollView>

        

        </ScrollView>
      </View>
    </View>
  );
}

