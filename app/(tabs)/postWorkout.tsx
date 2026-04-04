import { Feather } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { decode } from "base64-arraybuffer";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, H1, P } from "../../components/typography";
import Gradient from "../../components/ui/Gradient";
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
  workoutHistoryId?: string;
}

interface FriendOption {
  id: string;
  username: string;
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
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);
  const [friends, setFriends] = useState<FriendOption[]>([]);
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);

  const MAX_CHARACTERS = 1000;
  const MAX_FILE_SIZE = 50 * 1024; // 50 KB - set in Supabase, can change later

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

        // Parse PRs count from JSON string
        let prsCount = 0;
        if (data.prs) {
          try {
            const prsArray =
              typeof data.prs === "string" ? JSON.parse(data.prs) : data.prs;
            prsCount = Array.isArray(prsArray) ? prsArray.length : 0;
          } catch {
            prsCount = 0;
          }
        }

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
            value: `${data.exercises}`,
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
            value: `${prsCount} PRs`,
            visible: prsCount > 0,
            icon: "award",
          },
        ]);

        setDescription(``);
      } catch (error) {
        console.error("Error parsing workout data:", error);
      }
    }
  }, [workoutDataParam]);

  useEffect(() => {
    fetchTaggableFriends();
  }, [user?.id]);

  const fetchTaggableFriends = async () => {
    if (!user?.id) return;

    try {
      const [{ data: allProfiles, error: profilesError }, { data: friendsData, error: friendsError }] =
        await Promise.all([
          supabase.from("profiles").select("id, username"),
          supabase
            .from("friends")
            .select("user_id, friend_id")
            .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`),
        ]);

      if (profilesError) throw profilesError;
      if (friendsError) throw friendsError;

      const friendIds = new Set(
        (friendsData || []).map((f) =>
          f.user_id === user.id ? f.friend_id : f.user_id,
        ),
      );

      const formattedFriends = (allProfiles || [])
        .filter((profile) => profile.id !== user.id && friendIds.has(profile.id))
        .map((profile) => ({
          id: profile.id,
          username: profile.username,
        }));

      setFriends(formattedFriends);
    } catch (error) {
      console.error("Error fetching taggable friends:", error);
    }
  };

  const toggleFriendTag = (friendId: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
  };

  const uriToBlob = async (uri: string): Promise<Blob> => {
    const response = await fetch(uri);
    if (!response.ok)
      throw new Error(`Failed to fetch file: ${response.status}`);
    const blob = await response.blob();
    return blob;
  };

  const compressImage = async (uri: string): Promise<string | null> => {
    try {
      let quality = 0.8;
      let width = 1024;

      // Iteratively compress until under 50 KB
      for (let attempt = 0; attempt < 5; attempt++) {
        const manipResult = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width } }],
          { compress: quality, format: ImageManipulator.SaveFormat.JPEG },
        );

        const blob = await uriToBlob(manipResult.uri);
        const fileSize = blob.size;

        if (fileSize <= MAX_FILE_SIZE) {
          return manipResult.uri;
        }

        // Reduce quality and size more aggressively
        quality = Math.max(0.1, quality - 0.15);
        width = Math.max(400, Math.floor(width * 0.7));
      }

      // If still too large after 5 attempts, warn user
      console.log(
        "compressImage - Failed to compress under 50 KB after 5 attempts",
      );
      Alert.alert(
        "Image too large",
        "Unable to compress image below 50 KB. Please try a different image or take a new photo.",
      );
      return null;
    } catch (error) {
      console.error("Error compressing image:", error);
      Alert.alert(
        "Compression failed",
        "Failed to process image. Please try again.",
      );
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
      // Read file as base64
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            if (blob.size === 0) {
              console.error("uploadImageToSupabase - Empty file detected");
              Alert.alert("Error", "Image file is empty. Please try again.");
              resolve(null);
              return;
            }

            if (blob.size > MAX_FILE_SIZE) {
              console.error(
                "uploadImageToSupabase - File too large:",
                blob.size,
              );
              Alert.alert(
                "File too large",
                `Image is ${Math.round(blob.size / 1024)} KB, must be under 50 KB`,
              );
              resolve(null);
              return;
            }

            const base64String = (reader.result as string).split(",")[1];
            const filename = uri.split("/").pop() || `${Date.now()}.jpg`;
            const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
            const contentType = ext === "png" ? "image/png" : "image/jpeg";
            const path = `${user.id}/${Date.now()}-${filename}`;

            // Upload using base64-arraybuffer decode for native compatibility
            const { data, error: uploadError } = await supabase.storage
              .from("post-images")
              .upload(path, decode(base64String), {
                contentType,
                upsert: false,
              });

            if (uploadError) {
              console.error(
                "uploadImageToSupabase - Upload error:",
                uploadError,
              );
              throw uploadError;
            }

            // Get public URL
            const {
              data: { publicUrl },
            } = supabase.storage.from("post-images").getPublicUrl(path);

            resolve(publicUrl);
          } catch (error) {
            console.error(
              "uploadImageToSupabase - Error uploading image:",
              error,
            );
            Alert.alert(
              "Upload failed",
              "Failed to upload image. Please try again.",
            );
            resolve(null);
          }
        };

        reader.onerror = () => {
          console.error("uploadImageToSupabase - FileReader error");
          Alert.alert("Error", "Failed to read image file.");
          reject(null);
        };

        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("uploadImageToSupabase - Error:", error);
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
        workout_history_id: workoutData.workoutHistoryId
          ? parseInt(workoutData.workoutHistoryId)
          : null,
        description: description.trim() || null,
        image_url: imageUrl,
        visible_stats: visibleStats,
        workout_stats: workoutStats,
        tagged_friends: selectedFriendIds,
      });

      if (postError) {
        console.error("Error creating post:", postError);
        throw postError;
      }

      const uniqueTaggedFriendIds = Array.from(
        new Set(selectedFriendIds.filter((friendId) => friendId !== user.id)),
      );

      if (uniqueTaggedFriendIds.length > 0) {
        const streakUpdateResults = await Promise.all(
          uniqueTaggedFriendIds.map(async (friendId) => {
            const { error } = await supabase.rpc("increment_friends_streak", {
              p_user_id: user.id,
              p_other_user_id: friendId,
            });

            return { friendId, error };
          }),
        );

        const failedUpdates = streakUpdateResults.filter(
          (result) => result.error,
        );
        if (failedUpdates.length > 0) {
          console.warn(
            "Some tagged-friend streak updates failed:",
            failedUpdates,
          );
        }
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
  const selectedFriends = friends.filter((friend) =>
    selectedFriendIds.includes(friend.id),
  );
  const filteredFriends = friends.filter((friend) => {
    const isSelected = selectedFriendIds.includes(friend.id);
    const matchesSearch = friend.username
      .toLowerCase()
      .includes(friendSearchQuery.toLowerCase());
    return !isSelected && matchesSearch;
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <Gradient />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: height * 0.1,
          paddingHorizontal: width * 0.08,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
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
        {/* Tag Friends  */}
        <View style={{ width: width * 0.84, marginTop: 20 }}>
          <View className="flex-row justify-between items-center">
            <H1 baseSize={13}>Tag friends</H1>
            <TouchableOpacity
              onPress={() => setIsTagsOpen(!isTagsOpen)}
              className="p-2"
            >
              <Feather
                name={isTagsOpen ? "chevron-up" : "chevron-down"}
                size={24}
                color="#09090B"
              />
            </TouchableOpacity>
          </View>

          {isTagsOpen && (
            <View style={{ marginTop: 20 }}>
              <TextInput
                placeholder="Search your friends"
                value={friendSearchQuery}
                onChangeText={setFriendSearchQuery}
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: "#B1B0B0",
                  borderRadius: 8,
                  padding: 12,
                }}
              />

              {selectedFriends.length > 0 && (
                <View
                  style={{
                    marginTop: 12,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {selectedFriends.map((friend) => (
                    <TouchableOpacity
                      key={friend.id}
                      onPress={() => toggleFriendTag(friend.id)}
                      style={{
                        backgroundColor: "#FCDE8C",
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <P style={{ color: "#2D3541" }}>@{friend.username}</P>
                      <Feather name="x" size={14} color="#2D3541" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={{ marginTop: 12, gap: 8 }}>
                {filteredFriends.slice(0, 8).map((friend) => (
                  <TouchableOpacity
                    key={friend.id}
                    onPress={() => toggleFriendTag(friend.id)}
                    style={{
                      borderWidth: 1,
                      borderColor: "#DADADA",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <P style={{ color: "#32393d" }}>{friend.username}</P>
                    <Feather name="plus" size={16} color="#32393d" />
                  </TouchableOpacity>
                ))}

                {friends.length === 0 && (
                  <P style={{ color: "#666", fontSize: 13 }}>
                    Add friends first to tag them on your post.
                  </P>
                )}

                {friends.length > 0 && filteredFriends.length === 0 && (
                  <P style={{ color: "#666", fontSize: 13 }}>
                    No more matching friends.
                  </P>
                )}
              </View>
            </View>
          )}

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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
