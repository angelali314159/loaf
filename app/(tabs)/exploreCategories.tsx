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

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Gradient />

      {/* Title */}
      <View style={{ marginTop: 100, paddingHorizontal: 16 }}>
        <BackArrow page="/landingMain" />
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Explore Exercise Categories
        </Text>
      </View>

      {/* Grid */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: width * 0.05,
          paddingTop: 20,
          paddingBottom: height * 0.05,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          {categories.map((item) => (
            <Pressable
              key={item.name}
              onPress={() => handlePress(item)}
              style={({ pressed }) => ({
                flex: 1,
                minWidth: "30%",
                alignItems: "center",
                marginBottom: 25,
                opacity: pressed ? 0.6 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <Image
                source={item.image}
                style={{ width: 100, height: 100 }}
                resizeMode="contain"
              />
              <Text
                style={{ marginTop: 8, fontWeight: "600", color: "#32393d" }}
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
