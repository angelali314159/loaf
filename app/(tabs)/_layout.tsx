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
        tabBarActiveTintColor: "#000000", // Black for active/selected
        tabBarInactiveTintColor: "#FCDE8C", // Yellow for inactive/unselected
        tabBarStyle: Platform.select({
          default: {
            position: "absolute",
            backgroundColor: "transparent", // Make background transparent for overlay effect
            borderRadius: width * 0.13, // Oval shape
            marginHorizontal: width * 0.02, // Add some margin from edges
            marginBottom: height * 0.05, // Lift it up from bottom
            height: height * 0.09, // Make it taller for better oval shape
            borderTopWidth: 0, // Remove default border
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
        }}
      />
      <Tabs.Screen
        name="workoutComplete"
        options={{
          href: null, // This hides the tab
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
    </Tabs>
  );
}
