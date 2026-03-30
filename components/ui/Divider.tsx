/*
OVERVIEW: Horizontal line used to separate content. Can be customized with a color.
*/

import React from "react";
import { View } from "react-native";

interface DividerProps {
  color?: string;
}

export default function Divider({ color = "#DADADA" }: DividerProps) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: color,
        marginTop: 24,
        marginBottom: 24,
        marginHorizontal: 24,
      }}
    />
  );
}
