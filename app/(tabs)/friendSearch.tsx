import "../../global.css";
import React from "react";
import {ScrollView, Dimensions, View} from "react-native";
import { router, useRouter } from "expo-router";
import { Button, H1, H2, P } from "../../components/typography";
import Gradient from "@/components/ui/Gradient";
import { Pressable, Image } from "react-native";

export default function FriendSearch() {
  const { height } = Dimensions.get("window");
  const arrow = require('../../assets/images/back-arrow.png');
  //Must replace with actual friend search functionality, this is just a placeholder for now
  const friends = [
    { profile: "profile-pic.jpg", name: "Lisa Brown", id: 1 },
    { profile: "profile-pic.jpg", name: "Jane Smith", id: 2 },
  ]
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
      <H1 style={{ fontFamily: 'Inter_SemiBold' }}>Your friends</H1>
      {friends.map((friend) => (
        <View key={friend.id} className="flex flex-row justify-between items-center bg-[#FCDE8C] rounded-lg p-4 mb-4">
          <P style={{ fontFamily: 'Inter_SemiBold' }}>{friend.name}</P>
          <Button title="Add Friend" onPress={() => {console.log("Added friend: ", friend.name);}} color="black" fontColor="white" fontSize={14} />
        </View>
      ))}
    </ScrollView>
    </View>
  );
}