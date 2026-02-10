import { Feather } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Rect as SvgRect,
} from "react-native-svg";
import { Button, H1, P } from "../../components/typography";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabase";

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
  const { user } = useAuth();

  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [stats, setStats] = useState<WorkoutStat[]>([]);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isPicturesOpen, setIsPicturesOpen] = useState(true);
  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);

  const MAX_CHARACTERS = 1000;
  const MAX_FILE_SIZE = 500 * 1024; // 500 KB

  // Helper for random filename
  const randomFilename = (ext: string) =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  useEffect(() => {
    if (workoutDataParam) {
      try {
        const data: WorkoutData = JSON.parse(workoutDataParam);
        setWorkoutData(data);

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
      }
    }
  }, [workoutDataParam]);

  const compressImage = async (uri: string): Promise<string | null> => {
    try {
      // First, resize to reasonable dimensions
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }], // Resize width to 1024px, height auto
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
      );

      // Check file size
      const response = await fetch(manipResult.uri);
      const blob = await response.blob();

      if (blob.size <= MAX_FILE_SIZE) {
        return manipResult.uri;
      }

      // If still too large, compress more aggressively
      const secondPass = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG },
      );

      return secondPass.uri;
    } catch (error) {
      console.error("Error compressing image:", error);
      return null;
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant photo library access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const compressedUri = await compressImage(result.assets[0].uri);
      if (compressedUri) {
        setImageUri(compressedUri);
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera access");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const compressedUri = await compressImage(result.assets[0].uri);
      if (compressedUri) {
        setImageUri(compressedUri);
      }
    }
  };

  const uploadImageToSupabase = async (uri: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      // Get file extension
      const uriParts = uri.split(".");
      const ext = uriParts[uriParts.length - 1] || "jpg";

      // Build path matching RLS rule: userId/<filename>
      const filename = randomFilename(ext);
      const path = `1hys5dx_0/${filename}`; // TODO- change to userId

      // Fetch the file into a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Check file size
      if (blob.size > MAX_FILE_SIZE) {
        Alert.alert("File too large", "Image must be under 500 KB");
        return null;
      }

      // Set content-type
      const contentType = blob.type || `image/${ext}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(path, blob, { contentType });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(path);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Upload failed", "Failed to upload image. Please try again.");
      return null;
    }
  };

  const toggleStatVisibility = (index: number) => {
    const updatedStats = [...stats];
    updatedStats[index].visible = !updatedStats[index].visible;
    setStats(updatedStats);
  };

  const handlePost = async () => {
    if (!user?.id || !workoutData) {
      Alert.alert("Error", "Missing user or workout data");
      return;
    }

    try {
      setIsPosting(true);

      // Upload image if exists
      let imageUrl: string | null = null;
      if (imageUri) {
        imageUrl = await uploadImageToSupabase(imageUri);
        if (!imageUrl) {
          setIsPosting(false);
          return; // Upload failed, don't proceed
        }
      }

      // Prepare visible stats
      const visibleStats = stats
        .filter((stat) => stat.visible)
        .map((stat) => ({
          label: stat.label,
          value: stat.value,
          icon: stat.icon,
        }));

      // Prepare workout stats for storage
      const workoutStats = {
        duration: workoutData.duration,
        exercises: workoutData.exercises,
        sets: workoutData.sets,
        totalReps: workoutData.totalReps,
        weightLifted: workoutData.weightLifted,
        prs: workoutData.prs || 0,
      };

      // Insert workout post
      const { error: postError } = await supabase.from("workout_posts").insert({
        profile_id: user.id,
        workout_history_id: parseInt(workoutData.workoutHistoryId),
        description: description.trim() || null,
        image_url: imageUrl,
        visible_stats: visibleStats,
        workout_stats: workoutStats,
      });

      if (postError) {
        console.error("Error creating post:", postError);
        throw postError;
      }

      Alert.alert("Success!", "Your workout has been posted");
      router.push("/(tabs)/landingMain");
    } catch (error) {
      console.error("Error posting workout:", error);
      Alert.alert("Error", "Failed to post workout. Please try again.");
    } finally {
      setIsPosting(false);
    }
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
                    <Image
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
            title={isPosting ? "Posting..." : "Post Workout"}
            onPress={handlePost}
            color="yellow"
            fontColor="blue"
            width="100%"
            disabled={isPosting}
          />
          <Button
            title="Home"
            onPress={() => router.push("/(tabs)/landingMain")}
            color="blue"
            fontColor="white"
            width="100%"
            disabled={isPosting}
          />
        </View>
      </View>
    </View>
  );
}
