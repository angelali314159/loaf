import Gradient from "@/components/ui/Gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, H3, P } from "../../components/typography";
import "../../global.css";
import { supabase } from "../../utils/supabase";

export default function FriendSearch() {
  const { height } = Dimensions.get("window");
  const arrow = require("../../assets/images/back-arrow.png");
  const profile = require("../../assets/images/profile-pic.png");

  const [searchQuery, setSearchQuery] = React.useState("");
  const [allFriends, setAllFriends] = React.useState<any[]>([]);
  const [yourFriends, setYourFriends] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [pendingRequests, setPendingRequests] = React.useState<Set<string>>(
    new Set(),
  );
  const [incomingRequests, setIncomingRequests] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
    fetchIncomingRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Fetch all profiles for search
      const { data: allProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username");

      if (profilesError) throw profilesError;

      // Fetch user's friendships (where user is either user_id or friend_id)
      const { data: friendsData, error: friendsError } = await supabase
        .from("friends")
        .select("user_id, friend_id, streaks")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (friendsError) throw friendsError;

      const friendIds = new Set(
        friendsData?.map((f) =>
          f.user_id === user.id ? f.friend_id : f.user_id,
        ) || [],
      );

      const streaksByFriendId = new Map<string, number>();
      (friendsData || []).forEach((friendship) => {
        const friendId =
          friendship.user_id === user.id
            ? friendship.friend_id
            : friendship.user_id;
        const streakValue = Number(friendship.streaks) || 0;
        const previous = streaksByFriendId.get(friendId) || 0;
        streaksByFriendId.set(friendId, Math.max(previous, streakValue)); //for when bidirectional relationship occurs in friends table meaning more than one streak count shown
      });

      const formattedAllProfiles =
        allProfiles
          ?.filter((p) => p.id !== user.id)
          .map((p) => ({
            id: p.id,
            name: p.username,
            profile: "profile-pic.png",
            streaks: streaksByFriendId.get(p.id) || 0,
          })) || [];

      const formattedFriends = formattedAllProfiles.filter((p) =>
        friendIds.has(p.id),
      );

      setYourFriends(formattedFriends);
      setAllFriends(formattedAllProfiles);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("friend_requests")
        .select("receiver_id")
        .eq("requester_id", user.id);

      if (error) throw error;

      const pendingIds = new Set(data?.map((r) => r.receiver_id) || []);
      setPendingRequests(pendingIds);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("friend_requests")
        .select(
          `
          friend_request_id,
          requester_id,
          profiles!friend_requests_requester_fkey(id, username)
        `,
        )
        .eq("receiver_id", user.id);

      if (error) throw error;

      const formatted = (data || []).map((req) => ({
        request_id: req.friend_request_id,
        id: req.requester_id,
        name: (req.profiles as any).username,
        profile: "profile-pic.png",
      }));

      setIncomingRequests(formatted);
    } catch (error) {
      console.error("Error fetching incoming requests:", error);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    console.log("Adding friend with ID:", friendId);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase.from("friend_requests").insert([
        {
          requester_id: user.id,
          receiver_id: friendId,
        },
      ]);

      if (error) throw error;

      setPendingRequests((prev) => new Set([...prev, friendId]));
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleAcceptRequest = async (
    requesterId: string,
    requestId: string,
  ) => {
    try {
      // Call the accept_friend_request RPC function
      const { error } = await supabase.rpc("accept_friend_request", {
        p_request_id: requestId,
      });

      if (error) throw error;

      // Refresh data
      setIncomingRequests((prev) =>
        prev.filter((req) => req.request_id !== requestId),
      );
      fetchFriends();
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const filteredResults = allFriends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View
      className="flex-1 bg-[#f2f0ef] pt-20 gap-4"
      style={{ paddingBottom: height * 0.1, paddingHorizontal: 20 }}
    >
      <Gradient />
      {/* Back arrow  */}
      <Pressable onPress={() => router.navigate("/profile")}>
        <Image className="" source={arrow} resizeMode="contain" />
      </Pressable>
      {/* Search Bar */}
      <View className="flex flex-row items-center bg-[#E6E6E6] rounded-full px-4 py-2">
        <Feather name="search" size={18} color="#666" />
        <TextInput
          className="flex-1 ml-3 text-[#111] text-base"
          placeholder="Search friends..."
          placeholderTextColor="#777"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ paddingVertical: 0 }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Feather name="x-circle" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        className="flex-1 bg-[#f2f0ef]"
        style={{ paddingBottom: height * 0.1, paddingHorizontal: 20 }}
      >
        {/* Incoming Friend Requests */}
        {incomingRequests.length > 0 && (
          <View className="flex-1 flex-col mb-8">
            <H3 style={{ fontFamily: "Inter_SemiBold" }}>Friend Requests</H3>
            {incomingRequests.map((request) => (
              <TouchableOpacity
                key={request.request_id}
                className="py-2 border-b border-[#32393d]/20"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1 flex-row items-center mr-4 gap-4">
                    <Image
                      className="w-12 h-12 rounded-full"
                      source={profile}
                      resizeMode="cover"
                    />
                    <P
                      className="text-[#32393d]"
                      style={{ fontFamily: "Inter_Regular" }}
                    >
                      {request.name}
                    </P>
                  </View>
                  <Button
                    title="Accept"
                    width="18%"
                    fontSize={12}
                    height={8}
                    onPress={() =>
                      handleAcceptRequest(request.id, request.request_id)
                    }
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Search Results */}
        {searchQuery.length > 0 && (
          <View className="flex-1 flex-col mb-10">
            <H3 style={{ fontFamily: "Inter_SemiBold" }}>Results</H3>
            {filteredResults.length > 0 ? (
              filteredResults.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  className="py-2 border-b border-[#32393d]/20"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1 flex-row items-center mr-4 gap-4">
                      <Image
                        className="w-12 h-12 rounded-full"
                        source={profile}
                        resizeMode="cover"
                      />
                      <P
                        className="text-[#32393d]"
                        style={{ fontFamily: "Inter_Regular" }}
                      >
                        {friend.name}
                      </P>
                    </View>
                    <Button
                      title={
                        pendingRequests.has(friend.id) ? "Requested" : "Add"
                      }
                      width="18%"
                      fontSize={12}
                      height={8}
                      onPress={() => handleAddFriend(friend.id)}
                      disabled={pendingRequests.has(friend.id)}
                    />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <P className="text-[#666] mt-4">No friends found</P>
            )}
          </View>
        )}

        {/* Your friends  */}
        <View className="flex-col">
          <H3 style={{ fontFamily: "Inter_SemiBold" }}>Your friends</H3>
          {yourFriends.length > 0 ? (
            yourFriends.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                className="py-4 border-b border-[#32393d]/20"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex flex-row items-center mr-4 gap-4">
                    <Image
                      className="w-12 h-12 rounded-full"
                      source={profile}
                      resizeMode="contain"
                    />
                    <P
                      className="text-[#32393d]"
                      style={{ fontFamily: "Inter_Regular" }}
                    >
                      {friend.name}
                    </P>
                  </View>
                  {/* Friend Streaks */}
                  <View className="flex flex-row items-center justify-between gap-auto">
                    <Image
                      style={{ width: 24, height: 24 }}
                      source={require("../../assets/images/paw-friends.png")}
                      resizeMode="contain"
                    />
                    <P
                      className="flex text-[#32393d] text-end"
                      style={{ fontFamily: "Inter_Regular" }}
                    >
                      {friend.streaks}x
                    </P>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <P className="text-[#666] mt-4">No friends yet</P>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
