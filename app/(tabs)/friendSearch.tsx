import "../../global.css";
import React from "react";
import {ScrollView, Dimensions, View, TouchableOpacity, TextInput} from "react-native";
import { router, useRouter } from "expo-router";
import { Button, H3, P } from "../../components/typography";
import Gradient from "@/components/ui/Gradient";
import { Pressable, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function FriendSearch() {
  const { height } = Dimensions.get("window");
  const arrow = require('../../assets/images/back-arrow.png');
  //Must replace with actual friend search functionality, this is just a placeholder for now
  const friends = [
    { profile: "profile-pic.png", name: "Lisa Brown", id: 1, streaks: 5 },
    { profile: "profile-pic.png", name: "Jane Smith", id: 2, streaks: 120 },
  ]
  const [searchQuery, setSearchQuery] = React.useState("");
  const profile = require('../../assets/images/profile-pic.png');
  return (
    <View className="flex-1 bg-[#f2f0ef] pt-20 gap-4" style={{ paddingBottom: height * 0.10, paddingHorizontal: 20 }}>
    <Gradient />
    {/* Back arrow  */}
    <Pressable onPress={() => router.navigate('/profile')}>
    <Image
        className=""
        source={arrow}
        resizeMode="contain"
    />
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
    <ScrollView className="flex-1 bg-[#f2f0ef]" style={{ paddingBottom: height * 0.10, paddingHorizontal: 20 }}>
      {/* Search Results */}
      <View className="flex-1 flex-col mb-10">
        <H3 style={{ fontFamily: 'Inter_SemiBold' }}>Results</H3>
        {friends.map((friend) => (
          <TouchableOpacity
            key={friend.id}
            // onPress={() => } navigate to friend's profile 
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
                title="Add"
                width="18%"
                fontSize={12}
                height={8}
                onPress={() => {
                  // friend request function;
                }}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {/* Your friends  */}
      <View className="flex-1 flex-col">
        <H3 style={{ fontFamily: 'Inter_SemiBold' }}>Your friends</H3>
        {friends.map((friend) => (
          <TouchableOpacity
            key={friend.id}
            // onPress={() => } navigate to friend's profile 
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
                  source={require('../../assets/images/paw-friends.png')}
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
        ))}
      </View>
    </ScrollView>
    </View>
  );
}