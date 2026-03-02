import TabBarBackground from "@/components/ui/TabBarBackground";
import { Tabs } from "expo-router";
import { Dumbbell, House, TrendingUp, UserRound } from "lucide-react-native";
import React from "react";
import { Dimensions, Platform } from "react-native";
import TabBarItem from "../../components/ui/TabBarItem";

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
        name="stats"
        options={{
          title: "help",
          tabBarIcon: ({ color }) => <TrendingUp color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <UserRound color={color} />,
        }}
      />

      {/* Hidden screens - these won't appear in the tab bar */}
      <Tabs.Screen
        name="login"
        options={{
          href: null, // This hides the tab
          tabBarStyle: { display: "none" }, // This hides the entire tab bar on this screen
        }}
      />
      <Tabs.Screen
        name="signUp"
        options={{
          href: null, // This hides the tab
          tabBarStyle: { display: "none" }, // This hides the entire tab bar on this screen
        }}
      />
      <Tabs.Screen
        name="welcome"
        options={{
          href: null, // This hides the tab
          tabBarStyle: { display: "none" }, // This hides the entire tab bar on this screen
        }}
      />
      <Tabs.Screen
        name="exercisePreview"
        options={{
          href: null, // This hides the tab
        }}
      />
      <Tabs.Screen
        name="inWorkout"
        options={{
          href: null, // This hides the tab
          tabBarStyle: { display: "none" }, // This hides the entire tab bar on this screen
        }}
      />
      <Tabs.Screen
        name="allExercises"
        options={{
          href: null, // This hides the tab
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null, // This hides the tab
          tabBarStyle: { display: "none" }, // This hides the entire tab bar on this screen
        }}
      />
      <Tabs.Screen
        name="workoutComplete"
        options={{
          href: null, // This hides the tab
          tabBarStyle: { display: "none" }, // This hides the entire tab bar on this screen
        }}
      />
      <Tabs.Screen
        name="postWorkout"
        options={{
          href: null, // This hides the tab
          tabBarStyle: { display: "none" }, // This hides the entire tab bar on this screen
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // This hides the tab
        }}
      />
      <Tabs.Screen
        name="friendSearch"
        options={{
          href: null, // This hides the tab
        }}
      />
      <Tabs.Screen
        name="generateWorkout"
        options={{
          href: null, // This hides the tab
        }}
      />
      <Tabs.Screen
        name="generatedPreview"
        options={{
          href: null, // This hides the tab
        }}
      />
    </Tabs>
  );
}
