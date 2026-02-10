import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { H4, P } from "../../components/typography";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabase";

interface UserProfile {
  username: string;
  name: string;
}

interface FriendPost {
  workout_post_id: number;
  username: string;
  image_url: string;
  description: string;
  created_at: string;
  workout_stats: {
    duration: number;
    exercises: number;
    sets: number;
    weightLifted: number;
  };
  likes: number;
  isLiked: boolean;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [streak, setStreak] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [friendPosts, setFriendPosts] = useState<FriendPost[]>([]);
  const [loading, setLoading] = useState(true);

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
      fetchStreak();
      fetchFriendsCount();
      fetchFriendPosts();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile({
        username: data.username || "User",
        name: data.username || "User",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchStreak = async () => {
    if (!user?.id) return;

    try {
      // TO-DO: Implement streak calculation based on workout_history
      // For now, using mock data
      setStreak(7);
    } catch (error) {
      console.error("Error fetching streak:", error);
    }
  };

  const fetchFriendsCount = async () => {
    if (!user?.id) return;

    try {
      const { count, error } = await supabase
        .from("friends")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (error) throw error;
      setFriendsCount(count || 0);
    } catch (error) {
      console.error("Error fetching friends count:", error);
    }
  };

  const fetchFriendPosts = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get friend IDs
      const { data: friends, error: friendsError } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", user.id);

      if (friendsError) throw friendsError;

      const friendIds = friends?.map((f) => f.friend_id) || [];

      // Include user's own ID in the list
      const userIdsToFetch = [...friendIds, user.id];

      if (userIdsToFetch.length === 0) {
        setFriendPosts([]);
        setLoading(false);
        return;
      }

      // Get posts from friends and user
      const { data: posts, error: postsError } = await supabase
        .from("workout_posts")
        .select(
          `
          workout_post_id,
          profile_id,
          image_url,
          description,
          created_at,
          workout_stats,
          profiles!inner(username)
        `,
        )
        .in("profile_id", userIdsToFetch)
        .order("created_at", { ascending: false })
        .limit(20);

      if (postsError) {
        console.error("Posts error:", postsError);
        throw postsError;
      }

      console.log("Fetched posts:", posts); // Debug log

      // Format posts data
      const formattedPosts: FriendPost[] = (posts || []).map((post) => ({
        workout_post_id: post.workout_post_id,
        username: (post.profiles as any).username,
        image_url: post.image_url || "",
        description: post.description || "",
        created_at: post.created_at,
        workout_stats: post.workout_stats,
        likes: 0, // TO-DO: Implement likes count
        isLiked: false, // TO-DO: Check if user liked this post
      }));

      setFriendPosts(formattedPosts);
    } catch (error) {
      console.error("Error fetching friend posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSignedImageUrl = async (
    imagePath: string,
  ): Promise<string | null> => {
    if (!imagePath) return null;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return null;

      // Extract path from full URL if needed
      const path = imagePath.includes("post-images/")
        ? imagePath.split("post-images/")[1]
        : imagePath;

      const { data, error } = await supabase.storage
        .from("post-images")
        .createSignedUrl(path, 3600); // 1 hour expiry

      if (error) {
        console.error("Error getting signed URL:", error);
        return null;
      }

      return data?.signedUrl || null;
    } catch (error) {
      console.error("Error in getSignedImageUrl:", error);
      return null;
    }
  };

  const handleLikePost = async (postId: number) => {
    // TO-DO: Implement like functionality
    setFriendPosts((prev) =>
      prev.map((post) =>
        post.workout_post_id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
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

  const height = Dimensions.get("screen").height * 0.5;
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
          <Rect width="100%" height="100%" fill="url(#topSemiCircle)" />
        </Svg>
      </View>

      <ScrollView
        className={`flex-1`}
        showsVerticalScrollIndicator={false}
        style={{ marginTop: height * 0.08 }}
      >
        {/* Header with Name and Settings */}
        <View className="flex-row justify-between items-center px-6 pt-16 pb-4">
          <View className="flex-1">
            <P>Hello {profile?.name || "User"}</P>
            <P style={{ fontWeight: "700" }}>Let&apos;s review your progress</P>
          </View>
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
          <View className="flex-1 items-center">
            <H4 baseSize={9}>Streak</H4>
            <H4 className="mt-2" style={{ fontWeight: "700" }}>
              10 weeks
            </H4>
          </View>
          <View className="w-px bg-[#B1B0B0] mx-2" />

          {/* League */}
          <View className="flex-1 items-center">
            <H4 baseSize={9}>League</H4>
            <H4 className="mt-2" style={{ fontWeight: "700" }}>
              Biscuits
            </H4>
          </View>
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
              <View
                key={post.workout_post_id}
                className="mb-6 bg-white rounded-2xl shadow-sm border border-[#DADADA]"
              >
                {/* Post Header */}
                <View className="flex-row items-center p-4 pb-2">
                  <View className="w-10 h-10 rounded-full bg-[#FCDE8C] items-center justify-center mr-3">
                    <P className="text-[#32393d] font-bold">
                      {post.username.charAt(0).toUpperCase()}
                    </P>
                  </View>
                  <View className="flex-1">
                    <P className="text-[#32393d] font-semibold">
                      {post.username}
                    </P>
                    <P className="text-[#565656] text-xs">
                      {formatTimeAgo(post.created_at)}
                    </P>
                  </View>
                </View>

                {/* Post Image */}
                {post.image_url ? (
                  <Image
                    source={{ uri: post.image_url }}
                    style={{ width: "100%", height: screenWidth - 48 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{ width: "100%", height: screenWidth - 48 }}
                    className="bg-[#f2f0ef] items-center justify-center"
                  >
                    <Feather name="image" size={48} color="#DADADA" />
                  </View>
                )}

                {/* Stats Icons */}
                <View className="flex-row justify-around py-3 px-4 border-b border-[#DADADA]">
                  <View className="items-center">
                    <Feather name="clock" size={20} color="#32393d" />
                    <P className="text-xs text-[#565656] mt-1">
                      {formatDuration(post.workout_stats.duration)}
                    </P>
                  </View>
                  <View className="items-center">
                    <Feather name="list" size={20} color="#32393d" />
                    <P className="text-xs text-[#565656] mt-1">
                      {post.workout_stats.exercises} ex
                    </P>
                  </View>
                  <View className="items-center">
                    <Feather name="repeat" size={20} color="#32393d" />
                    <P className="text-xs text-[#565656] mt-1">
                      {post.workout_stats.sets} sets
                    </P>
                  </View>
                  <View className="items-center">
                    <Feather name="trending-up" size={20} color="#32393d" />
                    <P className="text-xs text-[#565656] mt-1">
                      {post.workout_stats.weightLifted} lbs
                    </P>
                  </View>
                </View>

                {/* Like Button and Caption */}
                <View className="p-4">
                  <TouchableOpacity
                    onPress={() => handleLikePost(post.workout_post_id)}
                    className="flex-row items-center mb-2"
                  >
                    <Feather
                      name={post.isLiked ? "heart" : "heart"}
                      size={20}
                      color={post.isLiked ? "#DD6C6A" : "#32393d"}
                      fill={post.isLiked ? "#DD6C6A" : "none"}
                    />
                    <P className="ml-2 text-[#565656]">{post.likes} likes</P>
                  </TouchableOpacity>

                  {post.description && (
                    <P className="text-[#32393d]">
                      <P className="font-semibold">{post.username}</P>{" "}
                      {post.description}
                    </P>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
