import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Image, TouchableOpacity, View } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { H2, P } from "../../components/typography";
import { useExerciseLibrary } from "../../contexts/ExerciseLibraryContext";

interface ExerciseData {
  name: string;
  type: string[];
  sets: number;
  reps: string;
  videolink: string;
  category: string | null;
  equipment: string | null;
}

export default function ExercisePreview() {
  const { exerciseName } = useLocalSearchParams<{ exerciseName: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const { getExerciseByName, loading } = useExerciseLibrary();

  // Get exercise data from context
  //CHARLOTTE, THIS IS HOW YOU PULL INFO ABOUT THE EXERCISE. IT'S FROM THE EXERICSELIBRARYCONTEXT.TSX FILE
  const exerciseFromLibrary = exerciseName
    ? getExerciseByName(exerciseName)
    : null;

  // Transform library data to match component interface
  const exerciseData: ExerciseData | null = exerciseFromLibrary
    ? {
        name: exerciseFromLibrary.name,
        type: exerciseFromLibrary.muscles
          .filter((m) => m.is_primary)
          .map((m) => m.name),
        sets: 3, // Default recommendation
        reps: "8-12", // Default recommendation
        videolink:
          exerciseFromLibrary.video_link?.split("v=")[1]?.split("&")[0] ||
          exerciseFromLibrary.video_link ||
          "dQw4w9WgXcQ",
        category: exerciseFromLibrary.category,
        equipment: exerciseFromLibrary.equipment,
      }
    : null;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <P>Loading exercise data...</P>
      </View>
    );
  }

  if (!exerciseData) {
    return (
      <View className="flex-1 justify-center items-center">
        <P>Exercise not found</P>
      </View>
    );
  }

  const images = [
    require("../../assets/images/southwest-filler-picture.jpg"), // TO-DO: Replace with actual exercise images for Southwest Rec
    require("../../assets/images/student-rec-filler-picture.jpg"), // TO-DO: Replace with actual exercise images for Student Rec
  ];

  return (
    <View className="flex-1">
      {/* Top Section */}
      <LinearGradient
        colors={["#d7cbfb", "#c4b2fa"]}
        className="flex-2 justify-center items-center"
        style={{ height: Dimensions.get("window").height * 0.4 }}
      >
        {/* Header */}
        <View className="absolute top-12 left-0 right-0 flex-row justify-between items-center px-10">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Feather name="arrow-left" size={27} color="#32393d" />
          </TouchableOpacity>

          <H2 className="text-[#32393d] text-center flex-1 mx-4">
            {exerciseData.name}
          </H2>

          <TouchableOpacity
            onPress={() => console.log("Add to workout")} // TO-DO: Implement add to workout functionality
            className="p-2"
          >
            <Feather name="plus" size={27} color="#32393d" />
          </TouchableOpacity>
        </View>

        {/* Bottom Info Boxes */}
        <View className="absolute bottom-0 left-0 right-0 flex-row justify-between px-4 pb-4">
          <View>
            <P className="text-white mb-2 ml-2 font-Montserrat_700Bold">
              Target
            </P>
            <View className="bg-white rounded-lg p-3 w-[158px] h-[60px] justify-center mx-2 border border-gray-200">
              <P className="text-[#32393d] text-sm text-center">
                {exerciseData.type.length > 0
                  ? exerciseData.type.join(", ")
                  : "N/A"}
              </P>
            </View>
          </View>
          <View>
            <P className="text-white mb-2 ml-2 font-Montserrat_700Bold">
              Recommendation
            </P>
            <View className="bg-white rounded-lg p-3 w-[158px] h-[60px] justify-center mx-2 border border-gray-200">
              <P className="text-[#32393d] text-sm text-center">
                {exerciseData.sets} sets of {exerciseData.reps}
              </P>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Middle Section - Video */}
      <View className="flex-2 items-center justify-center mx-5">
        <View
          className="rounded-lg overflow-hidden mt-5 border border-gray-200"
          style={{
            width: Dimensions.get("window").width * 0.8,
            height: 200,
          }}
        >
          <YoutubePlayer
            height={200}
            play={false}
            videoId={exerciseData.videolink}
          />
        </View>
      </View>

      {/* Bottom Section - Images */}
      <View className="flex-2 mx-5 justify-center items-center">
        <View className="bg-[#c4b2fa] rounded-lg p-3 w-[90%] h-full border border-gray-300">
          {/* Tabs */}
          <View className="flex-row justify-around mb-3">
            <TouchableOpacity
              className={`py-2 px-4 rounded ${selectedImage === 0 ? "bg-[#b9a4f6]" : "bg-gray-300"}`}
              onPress={() => setSelectedImage(0)}
            >
              <P
                className={`text-sm ${selectedImage === 0 ? "text-white" : "text-black"}`}
              >
                Southwest Rec
              </P>
            </TouchableOpacity>
            <TouchableOpacity
              className={`py-2 px-4 rounded ${selectedImage === 1 ? "bg-[#b9a4f6]" : "bg-gray-300"}`}
              onPress={() => setSelectedImage(1)}
            >
              <P
                className={`text-sm ${selectedImage === 1 ? "text-white" : "text-black"}`}
              >
                Student Rec
              </P>
            </TouchableOpacity>
          </View>

          {/* Image */}
          <View className="flex-1">
            <Image
              source={images[selectedImage]}
              className="w-full h-[80%] rounded-lg"
              style={{ resizeMode: "cover" }}
            />
          </View>
        </View>
      </View>

      {/* Buffer */}
      <View className="flex-1"></View>
    </View>
  );
}
