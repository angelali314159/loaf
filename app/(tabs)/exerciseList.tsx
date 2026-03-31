import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { supabase } from "../../utils/supabase";

const EXERCISE_IMAGES: Record<string, any> = {
  "filler.jpg": require("../../assets/images/Exercises/filler.jpg"),
  "latPulldown.jpg": require("../../assets/images/Exercises/latPulldown.jpg"),
  "legRaises.jpg": require("../../assets/images/Exercises/legRaises.jpg"),
  "russianTwists.jpg": require("../../assets/images/Exercises/russianTwists.jpg"),
  "shoulderPress.jpg": require("../../assets/images/Exercises/shoulderPress.jpg"),
  "seatedRows.jpg": require("../../assets/images/Exercises/seatedRows.jpg"),
  "shoulderShrugs.jpg": require("../../assets/images/Exercises/shoulderShrugs.jpg"),
  "sidePlanks.jpg": require("../../assets/images/Exercises/sidePlanks.jpg"),
  "sitUps.jpg": require("../../assets/images/Exercises/sitUps.jpg"),
  "standingCalfRaises.jpg": require("../../assets/images/Exercises/standingCalfRaises.jpg"),
  "tricepKickbacks.jpg": require("../../assets/images/Exercises/tricepKickbacks.jpg"),
  "tricepsDips.jpg": require("../../assets/images/Exercises/tricepsDips.jpg"),
  "tricepsRopePulldown.jpg": require("../../assets/images/Exercises/tricepsRopePulldown.jpg"),
  "frontRaise.jpg": require("../../assets/images/Exercises/frontRaise.jpg"),
  "preacherCurl.jpg": require("../../assets/images/Exercises/preacherCurl.jpg"),
  "lateralRaiseCable.jpg": require("../../assets/images/Exercises/lateralRaiseCable.jpg"),
  "latPulldownCable.jpg": require("../../assets/images/Exercises/latPulldownCable.jpg"),
  "seatedCalfRaise.jpg": require("../../assets/images/Exercises/seatedCalfRaise.jpg"),
  "sitUpsBodyweight.jpg": require("../../assets/images/Exercises/sitUpsBodyweight.jpg"),
  "skullCrusher.jpg": require("../../assets/images/Exercises/skullCrusher.jpg"),
  "standingCalfRaisesDumbbell.jpg": require("../../assets/images/Exercises/standingCalfRaisesDumbbell.jpg"),
  "tricepDips.jpg": require("../../assets/images/Exercises/tricepsDips.jpg"),
};

interface Exercise {
  exercise_lib_id: number;
  name: string;
  category: string | null;
  video_link: string | null;
  image_name: string | null;
}

export default function ListExercises() {
  const { name } = useLocalSearchParams<{ name: string }>();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const arrow = require("../../assets/images/back-arrow.png");

  const fetchExercises = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("exercise_library")
        .select("exercise_lib_id, name, category, video_link, image_name")
        .ilike("category", `%${name}%`);

      if (error) {
        console.log("Error fetching exercises:", error);
      } else {
        setExercises(data || []);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (name) {
      fetchExercises();
    }
  }, [name]);

  const getImageSource = (imageName: string | null) => {
    if (!imageName) return EXERCISE_IMAGES["filler.jpg"];
    const fileName = imageName.split("/").pop() || imageName;
    return EXERCISE_IMAGES[fileName] ?? EXERCISE_IMAGES["filler.jpg"];
  };

  const renderItem = ({ item }: { item: Exercise }) => (
    <Pressable
    onPress={() => router.push({ pathname: "/exercisePreview", params: { exerciseName: item.name } })}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        opacity: pressed ? 0.6 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      {/* Thumbnail */}
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          overflow: "hidden",
          backgroundColor: "#e5e5e5",
          marginRight: 14,
        }}
      >
        <Image
          source={getImageSource(item.image_name)}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>

      {/* Name and  Category */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#32393d" }}>
          {item.name}
        </Text>
        <Text style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
          {item.category ?? ""}
        </Text>
      </View>

    
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Background Gradient */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
        <Svg
          height={Dimensions.get("screen").height * 0.5}
          width={Dimensions.get("screen").width}
        >
          <Defs>
            <RadialGradient
              id="topSemiCircle"
              cx="50%"
              cy="0%"
              rx="120%"
              ry="70%"
            >
              <Stop offset="0%" stopColor="#FCDE8C" stopOpacity={0.9} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.1} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#topSemiCircle)" />
        </Svg>
      </View>

      {/* Header */}
      <View style={{ marginTop: 100, paddingHorizontal: 16 }}>
        <Pressable onPress={() => router.navigate("/exploreCategories")}>
          <Image source={arrow} resizeMode="contain" />
        </Pressable>

        <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 8 }}>
          {name} Exercises
        </Text>
      </View>

      {/* List */}
     
   
      <FlatList 
        data={exercises}
        keyExtractor={(item) => item.exercise_lib_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View
          
            style={{
              height: 1,
              backgroundColor: "rgba(50,57,61,0.08)",
              marginHorizontal: 16,
            }}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ textAlign: "center", marginTop: 50 }}>
              No exercises found.
            </Text>
          ) : null
        }
      />

    </View>
  );
}