import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function BlurTabBarBackground() {
  return (
    <View style={styles.container}>
      <BlurView
        tint="dark"
        intensity={80}
        style={[StyleSheet.absoluteFill, styles.blur]}
      />
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    borderRadius: width * 0.2,
    marginBottom: height * 0.03,
    height: height * 0.2,
    marginTop: -height * 0.008,
  },
  blur: {
    borderRadius: width * 0.2,
  },
  overlay: {
    backgroundColor: "#000000",
    opacity: 1,
    borderRadius: width * 0.2,
  },
});

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
