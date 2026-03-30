// OVERVIEW: Semicircle yellow and white gradiant background at the top of the screen

import { Dimensions, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

export default function Gradient() {
  return (
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
  );
}
