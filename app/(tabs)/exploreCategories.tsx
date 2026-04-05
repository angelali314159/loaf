import { router } from "expo-router";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import BackArrow from "../../components/ui/BackArrow";
import Gradient from "../../components/ui/Gradient";

const categories = [
  { name: "Abs", image: require("../../assets/images/Cats/Abs_Cat.png") },
  { name: "Chest", image: require("../../assets/images/Cats/Chest_Cat.png") },
  { name: "Back", image: require("../../assets/images/Cats/Back_Cat.png") },
  {
    name: "Hamstrings",
    image: require("../../assets/images/Cats/Hamstrings_Cat.png"),
  },
  { name: "Quads", image: require("../../assets/images/Cats/Quads_Cat.png") },
  { name: "Calves", image: require("../../assets/images/Cats/Calves_Cat.png") },
  {
    name: "Shoulders",
    image: require("../../assets/images/Cats/Shoulders_Cat.png"),
  },
  { name: "Biceps", image: require("../../assets/images/Cats/Biceps_Cat.png") },
  {
    name: "Triceps",
    image: require("../../assets/images/Cats/Triceps_Cat.png"),
  },
  { name: "Glutes", image: require("../../assets/images/Cats/Glutes_Cat.png") },
];

const { height, width } = Dimensions.get("window");

export default function Explore() {
  const handlePress = (category) => {
    router.push({
      pathname: "/exerciseList",
      params: { name: category.name },
    });
  };

  // Responsive image size based on screen height
  const imageSize = height * 0.12;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Gradient />

      {/* Title */}
      <View
        style={{ marginTop: height * 0.12, paddingHorizontal: width * 0.05 }}
      >
        <BackArrow page="/landingMain" />
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Explore Exercise Categories
        </Text>
      </View>

      {/* Grid */}
      <ScrollView
        contentContainerStyle={{
          paddingBottom: height * 0.05,
          paddingHorizontal: width * 0.05,
          flexGrow: 1,
          paddingTop: 10,
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
            width: "100%",
          }}
        >
          {categories.map((item) => (
            <Pressable
              key={item.name}
              onPress={() => handlePress(item)}
              style={({ pressed }) => ({
                width: width * 0.25,
                alignItems: "center",
                opacity: pressed ? 0.6 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <Image
                source={item.image}
                style={{ width: imageSize, height: imageSize }}
                resizeMode="contain"
              />
              <Text
                style={{
                  marginTop: 8,
                  fontWeight: "600",
                  color: "#32393d",
                  textAlign: "center",
                }}
              >
                {item.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
