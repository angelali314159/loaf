import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { H1, H2, P } from "../../components/typography";
import Gradient from "../../components/ui/Gradient";
import { supabase } from "../../utils/supabase";

interface Exercise {
  exercise_lib_id: number;
  name: string;
  exercise_order: number;
}

interface WorkoutPlan {
  name: string;
  duration: number;
  muscleGroups: string[];
  equipment: string[];
  exercises: Exercise[];
}

interface Profile {
  username: string;
  name: string;
  profile_image_url?: string;
}

const generateWeek = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
  const { username } = useLocalSearchParams<{ username?: string }>();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Fix 1: define isMountedRef
  const isMountedRef = useRef(true);

  const week = useMemo(() => generateWeek(), []);

  const mockWorkoutPlans: WorkoutPlan[] = [
    {
      name: "Back and Bicep Blast",
      duration: 40,
      muscleGroups: ["Back", "Biceps"],
      equipment: ["Machine", "Barbell", "Dumbbell"],
      exercises: [
        {
          exercise_lib_id: 48,
          name: "Lat Pulldown (Machine)",
          exercise_order: 1,
        },
        {
          exercise_lib_id: 50,
          name: "Bent Over Row (Barbell)",
          exercise_order: 2,
        },
        {
          exercise_lib_id: 81,
          name: "Preacher Curl",
          exercise_order: 3,
        },
        {
          exercise_lib_id: 95,
          name: "Bicep Curl (Dumbbell)",
          exercise_order: 4,
        },
      ],
    },
    {
      name: "Leg Day",
      duration: 50,
      muscleGroups: ["Legs", "Glutes"],
      equipment: ["Barbell", "Dumbbell"],
      exercises: [
        {
          exercise_lib_id: 74,
          name: "Squat (Barbell)",
          exercise_order: 1,
        },
        {
          exercise_lib_id: 71,
          name: "Lunge (Bodyweight)",
          exercise_order: 2,
        },
        {
          exercise_lib_id: 65,
          name: "Romanian Deadlift (Dumbbell)",
          exercise_order: 3,
        },
        {
          exercise_lib_id: 67,
          name: "Lying Leg Curl",
          exercise_order: 4,
        },
        {
          exercise_lib_id: 72,
          name: "Bulgarian Split Squat (Dumbbell)",
          exercise_order: 5,
        },
        {
          exercise_lib_id: 64,
          name: "Hip Adduction",
          exercise_order: 6,
        },
      ],
    },
    {
      name: "At Home Core Focus",
      duration: 20,
      muscleGroups: ["Core"],
      equipment: [],
      exercises: [
        {
          exercise_lib_id: 55,
          name: "Plank",
          exercise_order: 1,
        },
        {
          exercise_lib_id: 46,
          name: "Leg Raises",
          exercise_order: 2,
        },
        {
          exercise_lib_id: 87,
          name: "Sit Ups (Bodyweight)",
          exercise_order: 3,
        },
        {
          exercise_lib_id: 44,
          name: "Side Plank",
          exercise_order: 4,
        },
      ],
    },
  ];

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchProfileData = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, profile_image_url")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile({
        username: data.username || "User",
        name: data.username || "User",
        profile_image_url: data.profile_image_url,
      });

      if (data.profile_image_url) {
        const { data: signedData, error: signedError } = await supabase.storage
          .from("profile-images") // replace with your actual bucket name
          .createSignedUrl(data.profile_image_url, 60 * 60); // 1 hour expiry

        if (!signedError && signedData?.signedUrl && isMountedRef.current) {
          setProfileImageUrl(signedData.signedUrl);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const renderProfilePicture = () => {
    const initial = profile?.username?.[0]?.toUpperCase() || "U";

    if (profileImageUrl) {
      return (
        <Image
          source={{ uri: profileImageUrl }}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            borderWidth: 2,
            borderColor: "#FCDE8C",
          }}
          resizeMode="cover"
        />
      );
    }

    return (
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          borderWidth: 2,
          borderColor: "#FCDE8C",
          backgroundColor: "#FCDE8C",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#32393d" }}>
          {initial}
        </Text>
      </View>
    );
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }

    setWorkoutPlans(mockWorkoutPlans);
  }, [user]);

  const navigateToWorkout = (workoutPlan: WorkoutPlan) => {
    router.push({
      pathname: "/(tabs)/inWorkout",
      params: {
        sessionId: Date.now().toString(),
        workoutId: "mock-" + workoutPlan.name.replace(/\s+/g, "-"),
        workoutName: workoutPlan.name,
        exercises: JSON.stringify(workoutPlan.exercises),
        isSavedWorkout: "false",
      },
    });
  };

  const navigateToPreview = (workoutPlan: WorkoutPlan) => {
    router.push({
      pathname: "/(tabs)/generatedPreview",
      params: {
        duration: workoutPlan.duration,
        selectedGroups: JSON.stringify(workoutPlan.muscleGroups),
        selectedEquipments: JSON.stringify(workoutPlan.equipment),
      },
    });
  };

  const navigateToExerciseList = (categoryName: string) => {
    router.push({
      pathname: "/(tabs)/exerciseList",
      params: { name: categoryName },
    });
  };

  const navigateToWorkoutPreview = (workoutPlan: WorkoutPlan) => {
    router.push({
      pathname: "/(tabs)/workoutPreview",
      params: {
        workoutName: workoutPlan.name,
        duration: workoutPlan.duration,
        exercises: JSON.stringify(workoutPlan.exercises),
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <BlurView
        intensity={30}
        style={{
          width: 479.338,
          height: 119.909,
          position: "absolute",
          left: -50,
          top: -90,
          borderRadius: 479.338,
          backgroundColor: "#FFFEFE",
        }}
      />

      <View className="flex-1 bg-white">
        <ScrollView
          className="flex-1 mx-4"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          <Gradient />

          <View className="mt-32 mb-4 flex-row items-center px-4">
            <View className="mr-4">{renderProfilePicture()}</View>

            <View className="flex-1 ml-3">
              <H2 baseSize={15}>Hello {profile?.username ?? "!"}</H2>
              <H1 baseSize={15}>Are you ready for your workout?</H1>
            </View>
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
                    <Text style={{ fontSize: 14, fontWeight: "700" }}>✓</Text>
                  ) : (
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
            <H1 baseSize={13}>Explore New Workouts</H1>

            {workoutPlans.map((plan, index) => (
              <TouchableOpacity
                key={index}
                className="bg-white p-4 mb-3 shadow-sm"
                onPress={() => navigateToWorkoutPreview(plan)}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <P className="text-[#32393d] font-semibold text-lg">
                      {plan.name}
                    </P>
                    <P className="text-[#32393d] opacity-70 mt-1">
                      {plan.exercises
                        .slice(0, 2)
                        .map((ex) => ex.name)
                        .join(", ")}
                      {plan.exercises.length > 2 &&
                        `, +${plan.exercises.length - 2} more`}
                    </P>
                  </View>

                  <Pressable
                    className="w-20 py-2 rounded-2xl bg-[#FCDE8C] items-center"
                    onPress={() => navigateToWorkout(plan)}
                  >
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
            <H1 baseSize={13}>Explore Exercise Categories</H1>

            <Pressable onPress={() => router.push("/exploreCategories")}>
              <Text
                style={{ color: "#FAB906", fontSize: 15 }}
                className="font-bold tracking-wider"
              >
                View More
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            <View className="flex-row px-4">
              {/* Abs */}
              <Pressable
                onPress={() => navigateToExerciseList("Abs")}
                className="mr-6 items-center justify-between"
                style={{ width: 150, height: 190 }}
              >
                <Image
                  source={require("../../assets/images/Cats/Abs_Cat.png")}
                  style={{
                    height: 150,
                    width: 150,
                    marginTop: 3.5,
                    marginRight: 40,
                    marginLeft: 30,
                  }}
                  resizeMode="contain"
                />
                <Text className="text-center font-semibold text-[#32393d]">
                  Abs
                </Text>
              </Pressable>

              {/* Back */}
              <Pressable
                onPress={() => navigateToExerciseList("Back")}
                className="mr-6 items-center justify-between"
                style={{ width: 150, height: 190 }}
              >
                <Image
                  source={require("../../assets/images/Cats/Back_Cat.png")}
                  style={{ height: 150, width: 150 }}
                  resizeMode="contain"
                />
                <Text className="text-center font-semibold text-[#32393d]">
                  Back
                </Text>
              </Pressable>

              {/* Chest */}
              <Pressable
                onPress={() => navigateToExerciseList("Chest")}
                className="mr-6 items-center justify-between"
                style={{ width: 150, height: 190 }}
              >
                <Image
                  source={require("../../assets/images/Cats/Chest_Cat.png")}
                  style={{ height: 150, width: 150, marginTop: -7 }}
                  resizeMode="contain"
                />
                <Text className="text-center font-semibold text-[#32393d]">
                  Chest
                </Text>
              </Pressable>

              {/* Calves */}
              <Pressable
                onPress={() => navigateToExerciseList("Calves")}
                className="mr-6 items-center justify-between"
                style={{ width: 150, height: 190 }}
              >
                <Image
                  source={require("../../assets/images/Cats/Calves_Cat.png")}
                  style={{ height: 150, width: 150, marginTop: 1.5 }}
                  resizeMode="contain"
                />
                <Text className="text-center font-semibold text-[#32393d]">
                  Calves
                </Text>
              </Pressable>

              {/* Quads */}
              <Pressable
                onPress={() => navigateToExerciseList("Quads")}
                className="mr-6 items-center justify-between"
                style={{ width: 150, height: 190, marginTop: -7 }}
              >
                <Image
                  source={require("../../assets/images/Cats/Quads_Cat.png")}
                  style={{ height: 150, width: 150 }}
                  resizeMode="contain"
                />
                <Text className="text-center font-semibold text-[#32393d] mt-8">
                  Quads
                </Text>
              </Pressable>

              {/* Glutes */}
              <Pressable
                onPress={() => navigateToExerciseList("Glutes")}
                className="mr-6 items-center justify-between"
                style={{ width: 150, height: 190, marginTop: 5 }}
              >
                <Image
                  source={require("../../assets/images/Cats/Glutes_Cat.png")}
                  style={{ height: 150, width: 150 }}
                  resizeMode="contain"
                />
                <Text className="text-center font-semibold text-[#32393d]">
                  Glutes
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </ScrollView>
      </View>
    </View>
  );
}
