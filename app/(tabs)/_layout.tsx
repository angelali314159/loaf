//OVERVIEW: Has a list of all of the page in the app, and specifically handles showing the tab bar and
// whether the page shows up on the tab bar or if the tab bar shows up on that page.

import TabBarBackground from "@/components/TabBarBackground";
import { Tabs } from "expo-router";
import { Dumbbell, House, UserRound } from "lucide-react-native";
import React from "react";
import { Dimensions, Platform } from "react-native";
import TabBarItem from "../../components/TabBarItem";

const { width, height } = Dimensions.get("window");

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: (props) => <TabBarItem {...props} />,
        tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#FCDE8C",
        tabBarStyle: Platform.select({
          default: {
            position: "absolute",
            backgroundColor: "transparent",
            borderRadius: width * 0.13,
            marginHorizontal: width * 0.02,
            marginBottom: height * 0.05,
            height: height * 0.09,
            borderTopWidth: 0,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "400",
        },
      }}
    >
      {/* Screens list */}
      <Tabs.Screen
        name="landingMain"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <House color={color} />,
        }}
      />
      <Tabs.Screen
        name="workoutList"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color }) => <Dumbbell color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <UserRound color={color} />,
        }}
      />

      {/* Hidden screens */}
      <Tabs.Screen
        name="login"
        options={{
          href: null, // hides from the tab bar
          tabBarStyle: { display: "none" }, // hides the tab bar on the screen
        }}
      />
      <Tabs.Screen
        name="signUp"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="welcome"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="exercisePreview"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="inWorkout"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="allExercises"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="workoutComplete"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="postWorkout"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="friendSearch"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="generateWorkout"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="generatedPreview"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="exploreCategories"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="exerciseList"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
