import { router } from 'expo-router';
import { Dimensions, FlatList, Image, Pressable, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";




const categories = [
  { name: "Abs", image: require('../../assets/images/Cats/Abs_Cat.png') },

  { name: "Biceps", image: require('../../assets/images/Cats/Arms_Cat.png') },
  { name: "Triceps", image: require('../../assets/images/Cats/Arms_Cat.png') },

  { name: "Back", image: require('../../assets/images/Cats/Back_Cat.png') },
  { name: "Shoulders", image: require('../../assets/images/Cats/Back_Cat.png') },

  { name: "Chest", image: require('../../assets/images/Cats/Chest_Cat.png') },

  { name: "Glutes", image: require('../../assets/images/Cats/Glutes_Cat.png') },
  { name: "Calves", image: require('../../assets/images/Cats/Glutes_Cat.png') },
  {name: "Hamstrings", image: require('../../assets/images/Cats/Glutes_Cat.png') },
  {name: "Quads", image: require('../../assets/images/Cats/Glutes_Cat.png') },
  { name: "Stretching", image: require('../../assets/images/Cats/Stretching_Cat.png') },
];

export default function Explore() {

  const arrow = require('../../assets/images/back-arrow.png');

  const handlePress = (category) => {
    router.push({
      pathname: '/exerciseList',
      params: { name: category.name },
    });
  };

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => handlePress(item)}
      style={({ pressed }) => ({
        flex: 1,
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
      <Text style={{ marginTop: 8, fontWeight: "600", color: "#32393d" }}>
        {item.name}
      </Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>

      {/* Gradient Background */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
    
        <Svg
          height={Dimensions.get('screen').height * 0.5}
          width={Dimensions.get('screen').width}
        >
    
          <Defs>
            <RadialGradient id="topSemiCircle" cx="50%" cy="0%" rx="120%" ry="70%">
              <Stop offset="0%" stopColor="#FCDE8C" stopOpacity={0.9} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.1} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#topSemiCircle)" />
        </Svg>
      </View>

      

      {/* Title */}
      <View style={{ marginTop: 100, paddingHorizontal: 16 }}>

      <Pressable onPress={() => router.navigate('/landingMain')}>
        <Image
            className=""
            source={arrow}
            resizeMode="contain"
        />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Explore Exercise Categories
        </Text>
      </View>

    

      {/* Grid */}
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        numColumns={3}
        contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      />

    </View>
  );
}