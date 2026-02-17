import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import YoutubePlayer from "react-native-youtube-iframe";
import { P } from "../../components/typography";
import {
  ExerciseLibraryProvider,
  useExerciseLibrary,
} from "../../contexts/ExerciseLibraryContext";

const { height: SCREEN_H } = Dimensions.get("window");

// Static mapping of all exercise images in assets/images/exercises/
// Add new images here as you add them to the folder
const EXERCISE_IMAGES: Record<string, any> = {
  "filler.jpg": require("../../assets/images/exercises/filler.jpg"),
  "latPulldown.jpg": require("../../assets/images/exercises/latPulldown.jpg"),
  "legRaises.jpg": require("../../assets/images/exercises/legRaises.jpg"),
  "russianTwists.jpg": require("../../assets/images/exercises/russianTwists.jpg"),
  "shoulderPress.jpg": require("../../assets/images/exercises/shoulderPress.jpg"),
  "seatedRows.jpg": require("../../assets/images/exercises/seatedRows.jpg"),
  "shoulderShrugs.jpg": require("../../assets/images/exercises/shoulderShrugs.jpg"),
  "sidePlanks.jpg": require("../../assets/images/exercises/sidePlanks.jpg"),
  "sitUps.jpg": require("../../assets/images/exercises/sitUps.jpg"),
  "standingCalfRaises.jpg": require("../../assets/images/exercises/standingCalfRaises.jpg"),
  "tricepKickbacks.jpg": require("../../assets/images/exercises/tricepKickbacks.jpg"),
  "tricepsDips.jpg": require("../../assets/images/exercises/tricepsDips.jpg"),
  "tricepsRopePulldown.jpg": require("../../assets/images/exercises/tricepsRopePulldown.jpg"),
};

function ExercisePreviewContent() {
  // Support BOTH styles of params:
  // - old: exerciseName
  // - new: exerciseId (from your long-press)
  const params = useLocalSearchParams<{
    exerciseName?: string;
    exerciseId?: string;
  }>();

  const { getExerciseByName, loading } = useExerciseLibrary();

  // If you *only* have getExerciseByName, we can still support exerciseId by
  // passing exerciseName when navigating OR by adding getExerciseById later.
  // For now: use name if present; otherwise show "not found" message.
  const exerciseFromLibrary = useMemo(() => {
    if (params.exerciseName) return getExerciseByName(params.exerciseName);
    // If you want exerciseId support *fully*, add getExerciseById to your context.
    return null;
  }, [params.exerciseName, getExerciseByName]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <P>Loading exercise data...</P>
      </View>
    );
  }

  if (!exerciseFromLibrary) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <P className="mb-2">Exercise not found</P>
        <P className="text-sm text-gray-500 text-center">
          Looking for: "{params.exerciseName ?? `id=${params.exerciseId}`}"
        </P>

        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.85}
          className="mt-5 bg-gray-200 px-4 py-2 rounded-full"
        >
          <P>Go Back</P>
        </TouchableOpacity>
      </View>
    );
  }

  const primaryMuscles = exerciseFromLibrary.muscles
    .filter((m) => m.is_primary)
    .map((m) => m.name);

  const secondaryMuscles = exerciseFromLibrary.muscles
    .filter((m) => !m.is_primary)
    .map((m) => m.name);

  const videoId = exerciseFromLibrary.video_link
    ? exerciseFromLibrary.video_link.split("v=")[1]?.split("&")[0] ||
      exerciseFromLibrary.video_link
    : null;

  // Get image from static mapping
  const getImageSource = (imageName: string | null | undefined) => {
    if (!imageName) return null;

    // Remove any path prefixes if they exist
    const fileName = imageName.split("/").pop() || imageName;

    // Look up in our static mapping
    const imageSource = EXERCISE_IMAGES[fileName];

    if (!imageSource) {
      console.warn(
        `Image mapping not found for: ${fileName}. Add it to EXERCISE_IMAGES.`,
      );
    }

    return imageSource || null;
  };

  const imageSource = getImageSource(exerciseFromLibrary.image_name);
  const imageUrl =
    !imageSource && exerciseFromLibrary.image_url
      ? exerciseFromLibrary.image_url
      : null;

  return (
    <ScrollView className="flex-1 bg-white pb-120">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* TOP IMAGE */}
        <View style={{ height: SCREEN_H * 0.54, width: "100%" }}>
          {imageSource ? (
            <Image
              source={imageSource}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-gray-300 items-center justify-center">
              <Feather name="image" size={60} color="#999" />
            </View>
          )}
        </View>

        {/* SHEET (overlapping) */}
        <ScrollView style={{ marginTop: -42 }}>
          <View
            style={{
              borderTopLeftRadius: 36,
              borderTopRightRadius: 0,
              overflow: "hidden",
              backgroundColor: "#FFFFFF",
            }}
          >
            {/* subtle top radial gradient like screenshot */}
            <View style={{ paddingTop: 18, paddingBottom: 22 }}>
              {/* Radial gradient behind the header/muscle section */}
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "100%",
                }}
              >
                <Svg width="100%" height="100%">
                  <Defs>
                    <RadialGradient
                      id="topSemiCircle"
                      cx="50%"
                      cy="0%"
                      rx="150%"
                      ry="90%"
                      gradientUnits="objectBoundingBox"
                    >
                      <Stop
                        offset="0%"
                        stopColor="#FCDE8C"
                        stopOpacity={0.55}
                      />
                      <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={1} />
                    </RadialGradient>
                  </Defs>

                  <Rect width="100%" height="100%" fill="url(#topSemiCircle)" />
                </Svg>
              </View>

              {/* header row with arrow + title */}
              <View
                style={{
                  paddingHorizontal: 24,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  onPress={() => router.push("/createWorkout")}
                  activeOpacity={0.8}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 8,
                  }}
                >
                  <Image
                    source={require("../../assets/images/back-arrow.png")}
                    style={{ width: 22, height: 22, resizeMode: "contain" }}
                  />
                </TouchableOpacity>

                <Text
                  style={{
                    flex: 1,
                    fontSize: 28,
                    fontWeight: "700",
                    color: "#32393d",
                  }}
                  numberOfLines={2}
                >
                  {exerciseFromLibrary.name}
                </Text>
              </View>

              {/* muscles row */}
              <View
                style={{
                  paddingHorizontal: 24,
                  marginTop: 18,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <Image
                    source={require("../../assets/images/cat-waving.png")}
                    style={{ width: 46, height: 46, resizeMode: "contain" }}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#32393d", fontSize: 18 }}>
                    <Text style={{ fontWeight: "700" }}>Primary: </Text>
                    {primaryMuscles.length ? primaryMuscles.join(", ") : "N/A"}
                  </Text>

                  <View style={{ height: 10 }} />

                  <Text style={{ color: "#32393d", fontSize: 18 }}>
                    <Text style={{ fontWeight: "700" }}>Secondary: </Text>
                    {secondaryMuscles.length
                      ? secondaryMuscles.join(", ")
                      : "N/A"}
                  </Text>
                </View>
              </View>

              {/* divider */}
              <View
                style={{
                  height: 1,
                  backgroundColor: "rgba(50,57,61,0.18)",
                  marginTop: 18,
                  marginHorizontal: 24,
                }}
              />
            </View>

            {/* VIDEO CARD */}
            <View style={{ paddingHorizontal: 24 }}>
              <View
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                  backgroundColor: "#FFFFFF",
                  height: 210,
                }}
              >
                {videoId ? (
                  <YoutubePlayer height={210} play={false} videoId={videoId} />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Feather name="video-off" size={40} color="#666" />
                    <P className="text-gray-600 mt-2">No video available</P>
                  </View>
                )}
              </View>

              {/* ADD EXERCISE BUTTON */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  console.log("Add exercise:", exerciseFromLibrary.name);
                  console.log(
                    "Exercise ID:",
                    exerciseFromLibrary.exercise_lib_id,
                  );
                }}
                style={{
                  marginTop: 22,
                  backgroundColor: "#F7D57A",
                  borderRadius: 999,
                  paddingVertical: 14,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#32393d",
                  }}
                >
                  Add Exercise
                </Text>
              </TouchableOpacity>

              <View style={{ height: 12 }} />
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </ScrollView>
  );
}

// Wrapper with provider
export default function ExercisePreview() {
  return (
    <ExerciseLibraryProvider>
      <ExercisePreviewContent />
    </ExerciseLibraryProvider>
  );
}
