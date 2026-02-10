import { Feather } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, TextInput, TouchableOpacity, View } from "react-native";
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Rect as SvgRect,
} from "react-native-svg";
import { Button, H1, P } from "../../components/typography";

interface WorkoutStat {
  label: string;
  value: string;
  visible: boolean;
  icon: string;
}

interface WorkoutData {
  workoutName: string;
  duration: number;
  exercises: number;
  sets: number;
  totalReps: number;
  weightLifted: number;
  prs?: number;
}

export default function PostWorkout() {
  const params = useLocalSearchParams();
  const workoutDataParam = params.workoutData as string;

  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [stats, setStats] = useState<WorkoutStat[]>([]);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isPicturesOpen, setIsPicturesOpen] = useState(true);
  const [isStatsOpen, setIsStatsOpen] = useState(true);

  const MAX_CHARACTERS = 1000;

  useEffect(() => {
    if (workoutDataParam) {
      try {
        const data: WorkoutData = JSON.parse(workoutDataParam);

        // Format duration
        const hours = Math.floor(data.duration / 3600);
        const minutes = Math.floor((data.duration % 3600) / 60);
        const durationStr =
          hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;

        // Set stats from workout data
        setStats([
          {
            label: "Duration",
            value: durationStr,
            visible: true,
            icon: "clock",
          },
          {
            label: "Exercises",
            value: `${data.exercises} exercises`,
            visible: true,
            icon: "dumbbell",
          },
          {
            label: "Weight Lifted",
            value: `${data.weightLifted.toLocaleString()} lbs`,
            visible: true,
            icon: "weight-hanging",
          },
          {
            label: "PRs",
            value: `${data.prs || 0} PRs`,
            visible: true,
            icon: "award",
          },
        ]);

        // Set default description
        setDescription(`Completed ${data.workoutName}! 💪`);
      } catch (error) {
        console.error("Error parsing workout data:", error);
        // Fallback to default stats
        setStats([
          { label: "Duration", value: "45 min", visible: true, icon: "clock" },
          {
            label: "Exercises",
            value: "8 exercises",
            visible: true,
            icon: "dumbbell",
          },
          {
            label: "Weight Lifted",
            value: "2,500 lbs",
            visible: true,
            icon: "weight-hanging",
          },
          { label: "PRs", value: "3 PRs", visible: true, icon: "award" },
        ]);
      }
    } else {
      // Default stats if no data passed
      setStats([
        { label: "Duration", value: "45 min", visible: true, icon: "clock" },
        {
          label: "Exercises",
          value: "8 exercises",
          visible: true,
          icon: "dumbbell",
        },
        {
          label: "Weight Lifted",
          value: "2,500 lbs",
          visible: true,
          icon: "weight-hanging",
        },
        { label: "PRs", value: "3 PRs", visible: true, icon: "award" },
      ]);
    }
  }, [workoutDataParam]);

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      console.log("Photo library permission denied");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      console.log("Camera permission denied");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const toggleStatVisibility = (index: number) => {
    const updatedStats = [...stats];
    updatedStats[index].visible = !updatedStats[index].visible;
    setStats(updatedStats);
  };

  const handlePost = () => {
    // Handle posting workout
    console.log("Posting workout:", { description, imageUri, stats });
    router.push("/(tabs)/landingMain");
  };

  const height = Dimensions.get("screen").height;
  const width = Dimensions.get("screen").width;

  return (
    <View className="flex-1 bg-white">
      {/* SEMICIRCLE GRADIENT BACKGROUND */}
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
          <SvgRect width="100%" height="100%" fill="url(#topSemiCircle)" />
        </Svg>
      </View>

      <View
        className="flex-1 w-full items-start"
        style={{ marginTop: height * 0.1, marginHorizontal: width * 0.08 }}
      >
        {/* Description Section */}
        <View style={{ width: width * 0.84 }}>
          <View className="flex-row justify-between items-center">
            <H1 baseSize={13}>Description</H1>
            <TouchableOpacity
              onPress={() => setIsDescriptionOpen(!isDescriptionOpen)}
              className="p-2"
            >
              <Feather
                name={isDescriptionOpen ? "chevron-up" : "chevron-down"}
                size={24}
                color="#09090B"
              />
            </TouchableOpacity>
          </View>

          {isDescriptionOpen && (
            <View style={{ marginTop: 20 }}>
              <TextInput
                placeholder="How did your workout go?"
                value={description}
                onChangeText={(text) => {
                  if (text.length <= MAX_CHARACTERS) {
                    setDescription(text);
                  }
                }}
                multiline
                numberOfLines={3}
                maxLength={MAX_CHARACTERS}
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: "#B1B0B0",
                  borderRadius: 8,
                  padding: 12,
                  textAlignVertical: "top",
                  minHeight: height * 0.1,
                }}
              />
              <P
                className="text-right mt-1"
                style={{
                  color:
                    description.length >= MAX_CHARACTERS ? "#ff0000" : "#666",
                  fontSize: 12,
                }}
              >
                {description.length}/{MAX_CHARACTERS}
              </P>
            </View>
          )}

          {/* Divider */}
          <View
            style={{
              width: width * 0.84,
              height: 1,
              backgroundColor: "#DADADA",
              marginTop: 20,
            }}
          />

          {/* Pictures Section */}
          <View style={{ width: width * 0.84, marginTop: 20 }}>
            <View className="flex-row justify-between items-center">
              <H1 baseSize={13}>Pictures</H1>
              <TouchableOpacity
                onPress={() => setIsPicturesOpen(!isPicturesOpen)}
                className="p-2"
              >
                <Feather
                  name={isPicturesOpen ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#09090B"
                />
              </TouchableOpacity>
            </View>

            {isPicturesOpen && (
              <View style={{ marginTop: 20 }}>
                <View className="flex-row gap-4">
                  <TouchableOpacity
                    onPress={takePhoto}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: "#B1B0B0",
                      borderRadius: 8,
                      padding: 16,
                      alignItems: "center",
                    }}
                  >
                    <Feather name="camera" size={24} color="#09090B" />
                    <P className="mt-2">Take Photo</P>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={pickImageFromGallery}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: "#B1B0B0",
                      borderRadius: 8,
                      padding: 16,
                      alignItems: "center",
                    }}
                  >
                    <Feather name="image" size={24} color="#09090B" />
                    <P className="mt-2">Photo Gallery</P>
                  </TouchableOpacity>
                </View>
                {imageUri && (
                  <View style={{ marginTop: 12, position: "relative" }}>
                    <img
                      source={{ uri: imageUri }}
                      style={{
                        width: "100%",
                        height: 200,
                        borderRadius: 8,
                      }}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => setImageUri(null)}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        borderRadius: 20,
                        padding: 8,
                      }}
                    >
                      <Feather name="x" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Divider */}
          <View
            style={{
              width: width * 0.84,
              height: 1,
              backgroundColor: "#DADADA",
              marginTop: 20,
            }}
          />

          {/* Statistics Section */}
          <View style={{ width: width * 0.84, marginTop: 20 }}>
            <View className="flex-row justify-between items-center">
              <H1 baseSize={13}>Statistics display</H1>
              <TouchableOpacity
                onPress={() => setIsStatsOpen(!isStatsOpen)}
                className="p-2"
              >
                <Feather
                  name={isStatsOpen ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#09090B"
                />
              </TouchableOpacity>
            </View>

            {isStatsOpen && (
              <View
                style={{
                  marginTop: 20,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                {stats.map((stat, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => toggleStatVisibility(index)}
                    style={{
                      backgroundColor: stat.visible ? "#FCDE8C" : "#E5E5E5",
                      paddingHorizontal: 10,
                      paddingVertical: 7,
                      borderRadius: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <FontAwesome5 name={stat.icon} size={12} color="#2D3541" />
                    <P style={{ fontSize: 14, color: "#2D3541" }}>
                      {stat.value}
                    </P>
                    <Feather
                      name={stat.visible ? "x" : "plus"}
                      size={12}
                      color="#2D3541"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Buttons Section */}
        <View
          style={{
            width: width * 0.84,
            marginTop: 40,
          }}
        >
          <Button
            title="Post Workout"
            onPress={handlePost}
            color="yellow"
            fontColor="blue"
            width="100%"
          />
          <Button
            title="Home"
            onPress={() => router.push("/(tabs)/landingMain")}
            color="blue"
            fontColor="white"
            width="100%"
          />
        </View>
      </View>
    </View>
  );
}
