import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
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

export default function LandingMain() {
  const { username = 'Joy' } = useLocalSearchParams<{ username?: string }>();
  const [savedExercises, setSavedExercises] = useState<WorkoutPlan[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);

  // TO-DO: Replace with actual API calls
  const mockWorkoutPlans: WorkoutPlan[] = [
    { name: "Upper Body Blast", exercises: ["Bicep Curls", "Push-ups", "Shoulder Press"] },
    { name: "Leg Day", exercises: ["Squats", "Lunges", "Calf Raises"] },
    { name: "Core Focus", exercises: ["Planks", "Russian Twists", "Leg Raises"] }
  ];

  useEffect(() => {
    // TO-DO: Fetch workout plans from API based on username
    setSavedExercises(mockWorkoutPlans);
    setWorkoutPlans(mockWorkoutPlans);
  }, [username]);

  const navigateToExercises = (exerciseType: string) => {
    router.push({
      pathname: '/(tabs)/exercisePreview',
      params: { exerciseType }
    });
  };

  const navigateToWorkout = (workoutPlan: WorkoutPlan) => {
    router.push({
      pathname: '/(tabs)/inWorkout',
      params: { workoutId: workoutPlan.name }
    });
  };

  return (
    <View className="flex-1 bg-[#f2f0ef]">
      <ScrollView className="flex-1 mx-4">
        {/* Header */}
        <View className="mt-10 mb-4">
          <H1 className="text-[#32393d] text-4xl">Hello {username}!</H1>
          <P className="text-[#32393d] text-lg mt-2">Ready for your workout today?</P>
        </View>

        {/* Workouts Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <H2 className="text-[#32393d] text-2xl">Workouts</H2>
            <View className="flex-row gap-3">
              <TouchableOpacity 
                className="p-2"
                //onPress={() => router.push('/(tabs)/addWorkout')}
              >
                <Feather name="plus" size={27} color="#32393d" />
              </TouchableOpacity>
              <TouchableOpacity 
                className="p-2"
                //onPress={() => router.push('/(tabs)/generateWorkout')}
              >
                <Ionicons name="sparkles" size={23} color="#32393d" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Saved Workouts */}
          <LinearGradient 
            colors={['#FFD3D3', '#ffeded']} 
            locations={[0, 0.8]} 
            start={{x: 0, y: 0}} 
            end={{x: 0, y: 1}}
            className="rounded-lg p-4 min-h-[200px]"
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {savedExercises.map((item, index) => (
                <TouchableOpacity 
                  key={`${item.name}-${index}`}
                  className="bg-white/90 rounded-lg p-4 mb-3 flex-row justify-between items-center"
                  onPress={() => navigateToWorkout(item)}
                >
                  <View className="flex-1">
                    <P className="text-[#32393d] font-bold text-lg mb-2">{item.name}</P>
                    <View className="flex-row flex-wrap">
                      {item.exercises.slice(0, 3).map((exercise, exerciseIndex) => (
                        <View 
                          key={`${exercise}-${exerciseIndex}`}
                          className="bg-[#FFD3D3] rounded-lg px-3 py-1 mr-2 mb-1 border border-[#32393d]"
                        >
                          <P className="text-[#32393d] text-sm font-bold">{exercise}</P>
                        </View>
                      ))}
                      {item.exercises.length > 3 && (
                        <P className="text-[#32393d] text-sm">...</P>
                      )}
                    </View>
                  </View>
                  <Feather name="chevron-right" size={24} color="#32393d" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LinearGradient>
        </View>

        {/* Explore Workouts Section */}
        <View className="mb-8">
          <H2 className="text-[#32393d] text-2xl mb-4">Explore some workouts</H2>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-4">
              {/* Abs */}
              <TouchableOpacity
                className="w-32 h-48 rounded-lg overflow-hidden"
                onPress={() => navigateToExercises("Abs")}
              >
                <LinearGradient 
                  colors={['#E1D8FC', '#C4B2FA']} 
                  locations={[0.18, 0.7]} 
                  start={{x:0, y:0}}
                  className="flex-1 justify-between p-3"
                >
                  <P className="text-[#32393d] font-bold text-center">Abs</P>
                  <Image 
                    source={require('../../assets/images/cat-grey.png')} 
                    className="w-20 h-32 self-center"
                    style={{ resizeMode: 'contain' }}
                  />
                </LinearGradient>
              </TouchableOpacity>

              {/* Back */}
              <TouchableOpacity
                className="w-32 h-48 rounded-lg overflow-hidden"
                onPress={() => navigateToExercises("Back")}
              >
                <LinearGradient 
                  colors={['#DDF8FE', '#B3EEFB']} 
                  locations={[0.18, 0.7]} 
                  start={{x:0, y:0}}
                  className="flex-1 justify-between p-3"
                >
                  <P className="text-[#32393d] font-bold text-center">Back</P>
                  <Image 
                    source={require('../../assets/images/cat-scared.png')} 
                    className="w-20 h-32 self-center"
                    style={{ resizeMode: 'contain' }}
                  />
                </LinearGradient>
              </TouchableOpacity>

              {/* Biceps */}
              <TouchableOpacity
                className="w-32 h-48 rounded-lg overflow-hidden"
                onPress={() => navigateToExercises("Biceps")}
              >
                <LinearGradient 
                  colors={['#e5c5e6', '#d692d8']} 
                  locations={[0.18, 0.7]} 
                  start={{x:0, y:0}}
                  className="flex-1 justify-between p-3"
                >
                  <P className="text-[#32393d] font-bold text-center">Biceps</P>
                  <Image 
                    source={require('../../assets/images/cat-orange.png')} 
                    className="w-20 h-32 self-center"
                    style={{ resizeMode: 'contain' }}
                  />
                </LinearGradient>
              </TouchableOpacity>

              {/* Calves */}
              <TouchableOpacity
                className="w-32 h-48 rounded-lg overflow-hidden"
                onPress={() => navigateToExercises("Calves")}
              >
                <LinearGradient 
                  colors={['#c3d0df', '#85a8ce']} 
                  locations={[0.18, 0.8]} 
                  start={{x:0, y:0}}
                  className="flex-1 justify-between p-3"
                >
                  <P className="text-[#32393d] font-bold text-center">Calves</P>
                  <Image 
                    source={require('../../assets/images/cat-back.png')} 
                    className="w-24 h-32 self-center"
                    style={{ resizeMode: 'contain' }}
                  />
                </LinearGradient>
              </TouchableOpacity>

              {/* Chest */}
              <TouchableOpacity
                className="w-32 h-48 rounded-lg overflow-hidden"
                onPress={() => navigateToExercises("Chest")}
              >
                <LinearGradient 
                  colors={['#f3e2ef', '#f8b8ec']} 
                  locations={[0.18, 0.8]} 
                  start={{x:0, y:0}}
                  className="flex-1 justify-between p-3"
                >
                  <P className="text-[#32393d] font-bold text-center">Chest</P>
                  <Image 
                    source={require('../../assets/images/cat-fur.png')} 
                    className="w-28 h-32 self-center"
                    style={{ resizeMode: 'contain' }}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}