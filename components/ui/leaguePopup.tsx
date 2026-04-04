import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, Modal, Pressable, View } from "react-native";
import { H3, P } from "../typography";
interface LeaguePopupProps {
  visible: boolean;
  onClose: () => void;
}

export default function LeaguePopup({ visible, onClose }: LeaguePopupProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/40 items-center justify-center px-6"
        onPress={onClose}
      >
        <Pressable
          className="w-full max-w-sm rounded-2xl bg-white p-6"
          onPress={(event) => event.stopPropagation()}
        >
          <Pressable
            className="mt-6 self-end rounded-xl px-4 py-2"
            onPress={onClose}
          >
            <Feather name="x" size={20} color="#605e5e" />
          </Pressable>

          <View className="w-full px-6 mb-4 items-center">
            <Image
              source={require("../../assets/images/league_badge.png")}
              className="w-full h-auto"
              resizeMode="contain"
            />
          </View>
          <H3 className="text-[#32393d] text-center">Biscuits</H3>
          <P className="mt-3 text-[#565656]">
            This league celebrates the new gym-grinders who are enthusiastic to
            keep the dough rising
          </P>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
