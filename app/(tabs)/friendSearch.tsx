import "../../global.css";
import React from "react";
import {ScrollView, Dimensions, View, TouchableOpacity} from "react-native";
import { router, useRouter } from "expo-router";
import { Button, H3, P } from "../../components/typography";
import Gradient from "@/components/ui/Gradient";
import { Pressable, Image } from "react-native";

export default function FriendSearch() {
  const { height } = Dimensions.get("window");
  const arrow = require('../../assets/images/back-arrow.png');
  //Must replace with actual friend search functionality, this is just a placeholder for now
  const friends = [
    { profile: "profile-pic.png", name: "Lisa Brown", id: 1 },
    { profile: "profile-pic.png", name: "Jane Smith", id: 2 },
  ]
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
    <ScrollView className="flex-1 bg-[#f2f0ef]" style={{ paddingBottom: height * 0.10, paddingHorizontal: 20 }}>
      <View className="flex-1 flex-col mb-10">
      <H3 style={{ fontFamily: 'Inter_SemiBold' }}>Results</H3>
      {friends.map((friend) => (
        <TouchableOpacity
          key={friend.id}
          // onPress={() => } navigate to friend's profile 
          className="mt-2 mb-2 border-b border-[#32393d]/20"
        >
          <View className="flex-row justify-between items-start">
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
      <View>
      <H3 style={{ fontFamily: 'Inter_SemiBold' }}>Your friends</H3>
      {friends.map((friend) => (
        <TouchableOpacity
          key={friend.id}
          // onPress={() => } navigate to friend's profile 
          className="mt-2 mb-2 border-b border-[#32393d]/20"
        >
          <View className="flex-row justify-between items-start">
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
    </ScrollView>
    </View>
  );
}