import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Dimensions,
  Image,
  View
} from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { Button, H1, H2 } from "../../components/typography";
import { useAuth } from "../../contexts/AuthContext";

export default function Welcome() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    //if (isAuthenticated) {
     // router.replace("/(tabs)/landingMain");
    //}
  }, [isAuthenticated]);

  return (
    
    
      <View className="flex-1 bg-white justify-center">
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 0, backgroundColor:"#FCDE8C" }}
        >
          <Svg
            height={Dimensions.get("screen").height}
            width={Dimensions.get("screen").width}
          >

            {/* 3 LIGHTS GRADIENT BACKGROUND */}
            <Defs>
              <RadialGradient
                id="topRightCircle"
                cx="85%" //centered horizontally
                cy="0%" //top edge
                rx="100%" //horiztonal radius
                ry="10%" //vertical radius
                gradientUnits="objectBoundingBox"
              >
                <Stop offset="30%" stopColor="#FFFFFF" stopOpacity={0.5} />
                <Stop offset="100%" stopColor="#FCDE8C" stopOpacity={0.5} />
              </RadialGradient>

              <RadialGradient
                id="topLeftCircle"
                cx="30%" //centered horizontally
                cy="20%" //bottom edge
                rx="100%" //horiztonal radius
                ry="20%" //vertical radius
                gradientUnits="objectBoundingBox"
              >
                <Stop offset="30%" stopColor="#FFFFFF" stopOpacity={2.0} />
                <Stop offset="600%" stopColor="#FCDE8C" stopOpacity={0.5} />
              </RadialGradient>

              <RadialGradient
                id="bottomRightCircle"
                cx="97%" //centered horizontally
                cy="90%" //bottom edge
                rx="10%" //horiztonal radius
                ry="50%" //vertical radius
                gradientUnits="objectBoundingBox"
              >
                <Stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.9} />
                <Stop offset="200%" stopColor="#FCDE8C" stopOpacity={0.5} />
              </RadialGradient>
            </Defs>
            
            <Rect width="100%" height="100%" fill="url(#topLeftCircle)" />
            <Rect width="100%" height="100%" fill="url(#bottomRightCircle)" />
            <Rect width="100%" height="100%" fill="url(#topRightCircle)" />

          </Svg>
        </View>


      {/* Main Content */}
      <View style={{ marginHorizontal:"6%"}}>

        <View style={{ alignItems: "center"}}>
          <Image
            source={require("../../assets/images/cat_with_pink_ball.png")}
            style={{
              height: Dimensions.get("screen").width*.35,
              width: Dimensions.get("screen").width*.5,
            }}
            
            resizeMode="contain"
          />
        </View>
        
        <View style={{paddingVertical: 30}}>
          <H1 baseSize={25} style={{}}>
            Welcome to Loaf
          </H1>
          <H2 baseSize={14} style={{marginTop: 5 }}>
            Start your fitness journey
          </H2>
        </View>

        <View>
          <Button style= {{}}
            title="Create new account"
            color= "blue"
            fontColor= "white"
            width= "100%"
            
            onPress={() => router.push("/(tabs)/signUp")}
          />
          <Button
            title="Login"
            borderColor= "blue"
            width= "100%"
            onPress={() => router.push("/(tabs)/login")}
          />
        </View>


    </View>
  </View>
  );
}
