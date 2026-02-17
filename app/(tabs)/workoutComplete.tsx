import { router, useLocalSearchParams } from "expo-router";
import {useEffect, useRef, useState} from "react";
import { Button, H1, H2, P } from "../../components/typography";
import { useAuth } from "../../contexts/AuthContext";
import {
  Dimensions,
  Image,
  ScrollView,
  View,
  Animated
} from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import "../../workoutComplete.css";

export default function WorkoutComplete() {
  const params = useLocalSearchParams();
  const workoutData = params.workoutData as string;
  const { user } = useAuth();
  //Workout data 
  const workoutID = 1;  //Must Change: Placeholder for workout ID 
  const workoutHour = 1;  //Must Change: Placeholder for workout hour 
  const workoutMinute = 40;  //Must Change: Placeholder for workout minute
  const totalWeightLifted = 40;  //Must Change: Placeholder for total weight lifted (lbs)
  const totalSets = 4;  //Must Change: Placeholder for total sets completed
    const newExercises = ["Hammer Curl (Dumbbell)", "Lat Pulldown (Cable)"];  //Must Change: Placeholder for list of new exercises completed
  const numNewExercises = newExercises.length;  //Must Change: Placeholder for number of new exercises completed
    const newPRs = ["Hammer Curl (Dumbbell)", "Lat Pulldown (Cable)"];  //Must Change: Placeholder for list of new PRs achieved
  const numNewPRs = newPRs.length;

  //Animation 
  const slideAnim = useRef(new Animated.Value(300)).current; // Start 300px below
  const slideFromLeft = useRef(new Animated.Value(-500)).current; // Start 300px to the left
  const buttonColorAnim = useRef(new Animated.Value(0)).current; // 0 for beige, 1 for yellow
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0, // Slide up to normal position
      duration: 1000,
      useNativeDriver: false,
    }).start();
    Animated.timing(slideFromLeft, {
      toValue: 0, // Slide up to normal position
      duration: 1500,
      useNativeDriver: false,
    }).start();
    Animated.timing(buttonColorAnim, {
      toValue: 1,
      duration: 500, // Color transition duration
      useNativeDriver: false,
    }).start();
  }, []);
  // Convert animated value to color
  const [buttonColor, setButtonColor] = useState("#F1EAD2");
  useEffect(() => {
  const timer = setTimeout(() => {
    setButtonColor('#fcde8c'); 
  }, 1600); 
    return () => clearTimeout(timer); // cleanup timer on unmount
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
              cx="50%" //centered horizontally
              cy="0%" //top edge
              rx="150%" //horiztonal radius
              ry="70%" //vertical radius
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
          <H2><b>Congratulations {user?.username}, you finished your workout!</b></H2>
          <View className="gap-5 flex-1 mt-4">
            <H2><b>Let’s review your workout progress</b></H2>
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
                style={{transform: [{translateX: slideFromLeft}]}}
            />
            <Animated.View style={{transform: [{translateY: slideAnim}]}}>
              <P style={{ color: "#565656" }}>Workout length:
              <b>{workoutHour > 0 ? ` ${workoutHour} hr${workoutHour > 1 ? "s" : ""}${workoutMinute > 0 ? ", " : ""}` : ""}
              {workoutMinute > 0 ? `${workoutMinute} min${workoutMinute > 1 ? "s" : ""}` : ""}</b>
              </P>
            </Animated.View>
          </View>
          <View className="flex flex-row gap-2 justify-start items-center">
            <Animated.Image
                className=""
                source={require("../../assets/images/workoutComplete/weight.svg")}
                resizeMode="contain"
                style={{transform: [{translateX: slideFromLeft}]}}
            />
            <Animated.View style={{transform: [{translateY: slideAnim}]}}>
              <P style={{color: "#565656", transform: [{translateY: slideAnim}]}}>Total weight lifted: <b>{totalWeightLifted}</b> lbs</P>
            </Animated.View>
          </View>
          <View className="flex flex-row gap-2 justify-start items-center">
            <Animated.Image
                className=""
                source={require("../../assets/images/workoutComplete/barbell.svg")}
                resizeMode="contain"
                style={{transform: [{translateX: slideFromLeft}]}}
            />
            <Animated.View style={{transform: [{translateY: slideAnim}]}}>
              <P style={{ color: "#565656"}}>Total sets: <b>{totalSets}</b> lbs</P>
            </Animated.View>
          </View>
          <View className="flex flex-row gap-2 justify-start items-start">
            <Animated.Image
                className=""
                source={require("../../assets/images/workoutComplete/stars.svg")}
                resizeMode="contain"
                style={{transform: [{translateX: slideFromLeft}]}}
            />
            <Animated.View style={{transform: [{translateY: slideAnim}]}} className="gap-5">
              <P style={{ color: "#565656" }}>Completed <b>{numNewExercises }</b> new exercises:</P>
              {newExercises.map((exercise, index) => (
                <P style={{ color: "#565656" }} key={index} className="ml-4 italic">{exercise}</P>
                
              ))}
            </Animated.View>
          </View>
          <View className="flex flex-row gap-2 justify-start items-start">
            <Animated.Image
                className=""
                source={require("../../assets/images/workoutComplete/prize.svg")}
                resizeMode="contain"
                style={{transform: [{translateX: slideFromLeft}]}}  
            />
            <Animated.View style={{transform: [{translateY: slideAnim}]}} className="gap-5">
              <P style={{ color: "#565656" }}>Reached <b>{numNewPRs}</b> new personal records:</P>
              {newPRs.map((exercise, index) => (
                <P style={{ color: "#565656" }} key={index} className="ml-4 italic">{exercise}</P>

              ))}
            </Animated.View>
          </View>
            </ScrollView>
          </View>
        </View>
        <View className="flex flex-col pt-6">
          <Animated.View>
            <Button style={{ backgroundColor: buttonColor }} title="Post Workout" className="text-xs" onPress={handleShareWorkout} />
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
