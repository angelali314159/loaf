import { Feather } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, H4, P } from "../../components/typography";
import Gradient from "../../components/ui/Gradient";
import LeaguePopup from "../../components/ui/leaguePopup";
import { useAuth } from "../../contexts/AuthContext";
import { STORAGE_BUCKETS } from "../../utils/storageConstants";
import { supabase } from "../../utils/supabase";
import {
  getSignedImageUrl,
  getSignedImageUrls,
} from "../../utils/supabaseStorage";

interface UserProfile {
  username: string;
  name: string;
  profile_image_url?: string;
}

interface VisibleStat {
  label: string;
  value: string;
  icon: string;
}

interface FriendPost {
  workout_post_id: number;
  profile_id: string;
  username: string;
  taggedUsernames: string[];
  image_url: string;
  description: string;
  created_at: string;
  visible_stats: VisibleStat[];
  like_user_list: string[];
  isLiked: boolean;
}

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

      // Prepare workout stats for storage


export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [friendPosts, setFriendPosts] = useState<FriendPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState<Map<number, string>>(new Map());
  const [hasPendingRequests, setHasPendingRequests] = useState(false);
  const [isLeaguePopupVisible, setIsLeaguePopupVisible] = useState(false);
  const [fireEmojis, setFireEmojis] = useState<any[]>([]);
  const isMountedRef = useRef(true);
  const params = useLocalSearchParams();
  const workoutDataParam = params.workoutData as string;
  
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);
  const [stats, setStats] = useState<WorkoutStat[]>([]);

  useEffect(() => {
    if (workoutDataParam) {
      try {
        const data: WorkoutData = JSON.parse(workoutDataParam);
        setWorkoutData(data);
        console.log("Exercises check:", data.exercises);
        const hours = Math.floor(data.duration / 3600);
        const minutes = Math.floor((data.duration % 3600) / 60);
        const durationStr =
          hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;

        let prsCount = 0;
        if (data.prs) {
          const prsArray =
            typeof data.prs === "string" ? JSON.parse(data.prs) : data.prs;
          prsCount = Array.isArray(prsArray) ? prsArray.length : 0;
        }
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
            value: `${data.weightLifted.toLocaleString()}`,
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
      } catch (error) {
        console.error("Error parsing workout data:", error);
      }
    }
  }, [workoutDataParam]);

  const visibleStats = stats
    .filter((stat) => stat.visible)
    .map((stat) => ({
      label: stat.label,
      value: stat.value,
      icon: stat.icon,
  }));
  
  const workoutStats = workoutData ? {
  duration: workoutData.duration,
  exercises: workoutData.exercises,
  sets: workoutData.sets,
  totalReps: workoutData.totalReps,
  weightLifted: workoutData.weightLifted,
  prs: workoutData.prs || 0,
  } : null;

  useEffect(() => {
    if (user?.id) {
      fetchAllProfileData();
    }
  }, [user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      isMountedRef.current = true;

      if (user?.id) {
        fetchAllProfileData().catch((error) =>
          console.error("Error refreshing profile:", error),
        );
      }

      return () => {
        isMountedRef.current = false;
      };
    }, [user?.id]),
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loadImageUrls = async () => {
      if (friendPosts.length === 0) {
        setImageUrls(new Map());
        return;
      }

      try {
        // Get all image URLs in parallel instead of sequentially
        const imagesToFetch = friendPosts
          .filter((post) => post.image_url)
          .map((post) => post.image_url);

        if (imagesToFetch.length === 0) {
          setImageUrls(new Map());
          return;
        }

        const urlMap = await getSignedImageUrls(
          imagesToFetch,
          STORAGE_BUCKETS.POST_IMAGES,
        );

        // Map URLs back to post IDs
        const imageUrlMap = new Map<number, string>();
        friendPosts.forEach((post, index) => {
          if (post.image_url && urlMap.has(post.image_url)) {
            const signedUrl = urlMap.get(post.image_url);
            if (signedUrl) {
              imageUrlMap.set(post.workout_post_id, signedUrl);
            }
          }
        });

        if (isMountedRef.current) {
          setImageUrls(imageUrlMap);
        }
      } catch (error) {
        console.error("Error loading image URLs:", error);
      }
    };

    loadImageUrls();
  }, [friendPosts]);

  const fetchAllProfileData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_profile_page_data", {
        p_profile_id: user.id,
      });

      if (error) throw error;

      if (!isMountedRef.current) return;

      // Set profile data
      const profileData = data.profile;
      setProfile({
        username: profileData.username || "User",
        name: profileData.username || "User",
        profile_image_url: profileData.profile_image_url,
      });

      // Set streak
      setStreak(data.streak || 0);

      // Set friends count
      setFriendsCount(data.friend_count || 0);

      // Set pending requests
      setHasPendingRequests(data.has_pending_requests || false);

      // Format and set friend posts
      const formattedPosts: FriendPost[] = (data.posts || []).map(
        (post: any) => ({
          workout_post_id: post.workout_post_id,
          profile_id: post.profile_id,
          username: post.username,
          taggedUsernames: post.tagged_friends || [],
          image_url: post.image_url || "",
          description: post.description || "",
          created_at: post.created_at,
          visible_stats: post.visible_stats || [],
          like_user_list: post.like_user_list || [],
          isLiked: (post.like_user_list || []).includes(user.id),
        }),
      );
      setFriendPosts(formattedPosts);

      // Fetch signed URLs for profile image
      if (profileData.profile_image_url) {
        const signedUrl = await getSignedImageUrl(
          profileData.profile_image_url,
          STORAGE_BUCKETS.PROFILE_IMAGES,
        );
        if (signedUrl && isMountedRef.current) {
          setProfileImageUrl(signedUrl);
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const toggleStatVisibility = (index: number) => {
    const updatedStats = [...stats];
    updatedStats[index].visible = !updatedStats[index].visible;
    setStats(updatedStats);
  };

  const handleLikePost = async (postId: number) => {
    if (!user?.id) return;

    // Update local state optimistically
    setFriendPosts((prev) =>
      prev.map((post) =>
        post.workout_post_id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              like_user_list: post.isLiked
                ? post.like_user_list.filter((id) => id !== user.id)
                : [...post.like_user_list, user.id],
            }
          : post,
      ),
    );

    // Update backend
    try {
      const post = friendPosts.find((p) => p.workout_post_id === postId);
      if (!post) return;

      const updatedLikeList = post.isLiked
        ? post.like_user_list.filter((id) => id !== user.id)
        : [...post.like_user_list, user.id];

      const { error } = await supabase
        .from("workout_posts")
        .update({ like_user_list: updatedLikeList })
        .eq("workout_post_id", postId);

      if (error) {
        console.error("Error updating like:", error);
        // Revert optimistic update on error
        setFriendPosts((prev) =>
          prev.map((p) =>
            p.workout_post_id === postId
              ? {
                  ...p,
                  isLiked: !p.isLiked,
                  like_user_list: p.isLiked
                    ? [...p.like_user_list, user.id]
                    : p.like_user_list.filter((id) => id !== user.id),
                }
              : p,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const triggerFireRain = () => {
    const emojis = [];
    const emojiCount = 15;

    for (let i = 0; i < emojiCount; i++) {
      const animatedValue = new Animated.Value(0);
      const randomDelay = Math.random() * 200;
      const randomHorizontalOffset = Math.random() * screenWidth;

      Animated.sequence([
        Animated.delay(randomDelay),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Remove emoji after animation completes
        setFireEmojis((prev) => prev.filter((e) => e.id !== i));
      });

      emojis.push({
        id: i,
        animatedValue,
        x: randomHorizontalOffset,
      });
    }

    setFireEmojis(emojis);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}min`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 66);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return "Just now";
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

    // Fallback to initial letter
    return (
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: "#FCDE8C",
          borderWidth: 2,
          borderColor: "#FCDE8C",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <P style={{ fontSize: 24, fontWeight: "700", color: "#2D3541" }}>
          {initial}
        </P>
      </View>
    );
  };

  const height = Dimensions.get("screen").height * 0.5;
  const width = Dimensions.get("screen").width;

  return (
    <View className="flex-1 bg-white">
      <Gradient />

      {/* Fire Emoji Rain */}
      {fireEmojis.map((emoji) => (
        <Animated.View
          key={emoji.id}
          style={{
            position: "absolute",
            left: emoji.x,
            top: 0,
            zIndex: 1000,
            transform: [
              {
                translateY: emoji.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, screenHeight],
                }),
              },
            ],
            opacity: emoji.animatedValue.interpolate({
              inputRange: [0, 0.8, 1],
              outputRange: [1, 1, 0],
            }),
          }}
        >
          <P style={{ fontSize: 40 }}>🔥</P>
        </Animated.View>
      ))}

      <ScrollView
        className={`flex-1`}
        showsVerticalScrollIndicator={false}
        style={{ marginTop: height * 0.08, marginBottom: height * 0.3 }}
      >
        {/* Header with Profile Picture, Name and Settings */}
        <View className="flex-row justify-between items-center px-6 pt-16 pb-4">
          {/* Profile Picture */}
          <View className="mr-4">{renderProfilePicture()}</View>

          {/* Name and greeting */}
          <View className="flex-1">
            <P>Hello {profile?.name || "User"}</P>
            <P style={{ fontWeight: "700" }}>Let&apos;s review your progress</P>
          </View>

          {/* Settings Icon */}
          <TouchableOpacity onPress={() => router.push("/(tabs)/settings")}>
            <Feather name="settings" size={24} color="#32393d" />
          </TouchableOpacity>
        </View>

        {/* Stats Row - 3 Columns */}
        <View
          className="flex-row items-stretch px-6 py-6 gap-3"
          style={{ marginTop: height * 0.04 }}
        >
          {/* Streak */}
          <TouchableOpacity
            className="flex-1 items-center"
            onPress={triggerFireRain}
          >
            <H4 baseSize={9}>Streak</H4>
            <H4 className="mt-2" style={{ fontWeight: "700" }}>
              10 weeks
            </H4>
          </TouchableOpacity>
          <View className="w-px bg-[#B1B0B0] mx-2" />

          {/* League */}
          <TouchableOpacity
            className="flex-1 items-center"
            onPress={() => setIsLeaguePopupVisible(true)}
          >
            <H4 baseSize={9}>League</H4>
            <H4 className="mt-2" style={{ fontWeight: "700" }}>
              Biscuits
            </H4>
          </TouchableOpacity>
          <View className="w-px bg-[#B1B0B0] mx-2" />

          {/* Friends */}
          <TouchableOpacity
            className="flex-1 items-center"
            onPress={() => router.push("/(tabs)/friendSearch")}
          >
            <H4 baseSize={9}>Friends</H4>
            <H4 className="mt-2" style={{ fontWeight: "700" }}>
              {friendsCount}
            </H4>
          </TouchableOpacity>
        </View>

        {/*Date Range Selector*/}
        <View style={{ flexDirection:"row", paddingHorizontal:28, marginTop:30}}>
          <Button style={{ marginRight:12 }}
            title= {"All Time"}
            color="yellow"
            width="30%" 
            height= {10}
            fontColor="blue"
            fontSize={12}
            onPress={function (): void {}}
          />
          <Button style={{ marginRight:12 }}
            title="This Week"
            color="blue"
            width="30%" 
            height="5%"
            fontColor="white"
            fontSize={12}
            onPress={function (): void {}}
          />
          <Button
            title="This Month"
            color="blue"
            width="30%" 
            height="5%"
            fontColor="white"
            fontSize={12}
            onPress={function (): void {}}
          />
        </View>

        {/* Friends' Posts Feed */}
        <View className="px-6 pb-6">
          {loading ? (
            <View className="items-center justify-center py-8">
              <P className="text-[#565656]">Loading posts...</P>
            </View>
          ) : friendPosts.length === 0 ? (
            <View className="items-center justify-center py-8">
              <P className="text-[#565656] text-center">
                No posts from friends yet.{"\n"}Add friends to see their
                workouts!
              </P>
            </View>
          ) : (
            friendPosts.map((post) => (
              <><View
                key={post.workout_post_id}
              >
                {/* Post Header */}
                <View className="flex-row items-center p-4 pb-2">
                  <View className="flex-1">
                    <P className="text-[#32393d] font-semibold">
                      {post.username}
                    </P>
                    {post.taggedUsernames.length > 0 && (
                      <P className="text-[#565656] text-xs mt-1">
                        with{" "}
                        {post.taggedUsernames
                          .map((name) => `@${name}`)
                          .join(", ")}
                      </P>
                    )}
                    <P className="text-[#565656] text-xs">
                      {formatTimeAgo(post.created_at)}
                    </P>
                  </View>
                </View>

                {/* Post Image */}
                {imageUrls.get(post.workout_post_id) ? (
                  <Image
                    source={{ uri: imageUrls.get(post.workout_post_id) }}
                    style={{ width: "100%", height: screenWidth - 48 }}
                    resizeMode="cover" />
                ) : post.image_url ? (
                  <View
                    style={{ width: "100%", height: screenWidth - 48 }}
                    className="bg-[#f2f0ef] items-center justify-center"
                  >
                    <P className="text-[#565656]">Loading image...</P>
                  </View>
                ) : (
                  <View
                    style={{ width: "100%", height: screenWidth - 48 }}
                    className="bg-[#f2f0ef] items-center justify-center"
                  >
                    <Feather name="image" size={48} color="#DADADA" />
                  </View>
                )}

                {/* Stats Icons with Like Button */}
                <View className="flex-row items-left p-4 pt-2" style={{ marginHorizontal: -15, marginBottom: -25}}>
                  <View className="flex-row flex-1 justify-around" style={{ justifyContent: "flex-start", gap: 8}}>
                    {post.visible_stats && post.visible_stats.map((stat, index) => (
                      <View key={index} className="items-left">
                        <TouchableOpacity
                        onPress={function (): void {}}
                        style={{
                          backgroundColor: "#fffefe",
                          paddingHorizontal: 10,
                          paddingVertical: 2,
                          borderRadius: 20,
                          borderColor: "#3c3f42",
                          borderWidth: 1,
                          flexDirection: "row",
                          gap: 8,
                        }}
                        >
                        <FontAwesome5
                          name={stat.icon}
                          size={15}
                          color="#32393d"/>
                          <P className="text-xs text-[#565656] mt-1">
                            {stat.value}
                          </P>
                      </TouchableOpacity>
                      </View>
                      ))}
                  </View>

                  {/* Like button */}
                  <TouchableOpacity
                    onPress={() => handleLikePost(post.workout_post_id)}
                    className="flex-row items-center ml-4"
                  >
                    <Image
                      source={
                        post.like_user_list.includes(user?.id || "")
                          ? require("../../assets/images/paw-filled.png")
                          : require("../../assets/images/paw-outline.png")
                      }
                      style={{ width: 24, height: 24 }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  {post.profile_id === user?.id && (
                    <P className="text-[#565656] mr-2">
                      {post.like_user_list.length}
                    </P>
                  )}
                </View>
              </View>
              <View>
                {/* Caption */}
                {post.description && (
                  <View className="p-4">
                    <P className="text-[#32393d]">{post.description}</P>
                  </View>
                )}
              </View></>
            ))
          )}
        </View>
      </ScrollView>

      <LeaguePopup
        visible={isLeaguePopupVisible}
        onClose={() => setIsLeaguePopupVisible(false)}
      />
    </View>
  );
}
