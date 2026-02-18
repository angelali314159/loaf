import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, ScrollView, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { Button, H2, P } from "../../components/typography";
import { useAuth } from "../../contexts/AuthContext";
import "../../workoutComplete.css";

interface PRData {
  exercise_id: number;
  exercise_name: string;
  new_weight: number;
  previous_weight: number;
}

interface WorkoutData {
  workoutHistoryId: string;
  workoutName: string;
  duration: number; // in seconds
  exercises: number;
  sets: number;
  totalReps: number;
  weightLifted: number;
  prs: string; // JSON string of PRData[]
}

export default function WorkoutComplete() {
  const params = useLocalSearchParams();
  const workoutDataString = params.workoutData as string;
  const { user } = useAuth();

  // Parse workout data from params
  const workoutData: WorkoutData | null = useMemo(() => {
    if (!workoutDataString) return null;
    try {
      return JSON.parse(workoutDataString);
    } catch (e) {
      console.error("Error parsing workout data:", e);
      return null;
    }
  }, [workoutDataString]);

  // Parse PRs from workout data
  const prs: PRData[] = useMemo(() => {
    if (!workoutData?.prs) return [];
    try {
      return JSON.parse(workoutData.prs);
    } catch (e) {
      console.error("Error parsing PRs:", e);
      return [];
    }
  }, [workoutData]);

  // Calculate hours and minutes from duration (seconds)
  const workoutHour = workoutData ? Math.floor(workoutData.duration / 3600) : 0;
  const workoutMinute = workoutData
    ? Math.floor((workoutData.duration % 3600) / 60)
    : 0;
  const totalWeightLifted = workoutData?.weightLifted ?? 0;
  const totalSets = workoutData?.sets ?? 0;
  const newPRs = prs.map((pr) => pr.exercise_name);
  const numNewPRs = newPRs.length;

  //Animation
  const slideAnim = useRef(new Animated.Value(300)).current;
  const slideFromLeft = useRef(new Animated.Value(-500)).current;
  const buttonColorAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: false,
    }).start();
    Animated.timing(slideFromLeft, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: false,
    }).start();
    Animated.timing(buttonColorAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, []);
  const [buttonColor, setButtonColor] = useState("#F1EAD2");
  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonColor("#fcde8c");
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  const handleShareWorkout = () => {
    router.push({
      pathname: "/(tabs)/postWorkout",
      params: { workoutData: workoutDataString },
    });
  };

  return (
    <View className="flex-1 bg-[#f2f0ef] h-full">
      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 0 }}
      >
        <Svg
          height={Dimensions.get("screen").height * 0.5}
          width={Dimensions.get("screen").width}
        >
          <Defs>
            <RadialGradient
              id="topSemiCircle"
              cx="50%"
              cy="0%"
              rx="150%"
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
      <View className="px-4 py-20 flex-1">
        <View className="flex-1">
          <H2>
            <b>Congratulations {user?.username}, you finished your workout!</b>
          </H2>
          <View className="gap-5 flex-1 mt-4">
            <H2>
              <b>Let's review your workout progress</b>
            </H2>
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingVertical: 16, gap: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <View className="flex flex-row gap-2 justify-start items-center">
                <Animated.Image
                  className=""
                  source={require("../../assets/images/workoutComplete/clock.svg")}
                  resizeMode="contain"
                  style={{ transform: [{ translateX: slideFromLeft }] }}
                />
                <Animated.View
                  style={{ transform: [{ translateY: slideAnim }] }}
                >
                  <P style={{ color: "#565656" }}>
                    Workout length:
                    <b>
                      {workoutHour > 0
                        ? ` ${workoutHour} hr${workoutHour > 1 ? "s" : ""}${workoutMinute > 0 ? ", " : ""}`
                        : ""}
                      {workoutMinute > 0
                        ? `${workoutMinute} min${workoutMinute > 1 ? "s" : ""}`
                        : workoutHour === 0
                          ? " < 1 min"
                          : ""}
                    </b>
                  </P>
                </Animated.View>
              </View>
              <View className="flex flex-row gap-2 justify-start items-center">
                <Animated.Image
                  className=""
                  source={require("../../assets/images/workoutComplete/weight.svg")}
                  resizeMode="contain"
                  style={{ transform: [{ translateX: slideFromLeft }] }}
                />
                <Animated.View
                  style={{ transform: [{ translateY: slideAnim }] }}
                >
                  <P style={{ color: "#565656" }}>
                    Total weight lifted: <b>{totalWeightLifted}</b> lbs
                  </P>
                </Animated.View>
              </View>
              <View className="flex flex-row gap-2 justify-start items-center">
                <Animated.Image
                  className=""
                  source={require("../../assets/images/workoutComplete/barbell.svg")}
                  resizeMode="contain"
                  style={{ transform: [{ translateX: slideFromLeft }] }}
                />
                <Animated.View
                  style={{ transform: [{ translateY: slideAnim }] }}
                >
                  <P style={{ color: "#565656" }}>
                    Total sets: <b>{totalSets}</b>
                  </P>
                </Animated.View>
              </View>
              {numNewPRs > 0 && (
                <View className="flex flex-row gap-2 justify-start items-start">
                  <Animated.Image
                    className=""
                    source={require("../../assets/images/workoutComplete/prize.svg")}
                    resizeMode="contain"
                    style={{ transform: [{ translateX: slideFromLeft }] }}
                  />
                  <Animated.View
                    style={{ transform: [{ translateY: slideAnim }] }}
                    className="gap-5"
                  >
                    <P style={{ color: "#565656" }}>
                      Reached <b>{numNewPRs}</b> new personal record
                      {numNewPRs > 1 ? "s" : ""}:
                    </P>
                    {prs.map((pr, index) => (
                      <View key={index} className="ml-4">
                        <P style={{ color: "#565656", fontStyle: "italic" }}>
                          {pr.exercise_name}
                        </P>
                        <P style={{ color: "#888", fontSize: 12 }}>
                          {pr.previous_weight > 0
                            ? `${pr.previous_weight} lbs → ${pr.new_weight} lbs`
                            : `First time!`}
                        </P>
                      </View>
                    ))}
                  </Animated.View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
        <View className="flex flex-col pt-6">
          <Animated.View>
            <Button
              style={{ backgroundColor: buttonColor }}
              title="Post Workout"
              className="text-xs"
              onPress={handleShareWorkout}
            />
          </Animated.View>
          <Button
            title="Home"
            color="black"
            fontColor="white"
            onPress={() => router.push("/(tabs)/landingMain")}
          />
        </View>
      </View>
    </View>
  );
}
