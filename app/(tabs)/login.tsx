import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, H1, H2, P, TextLineInput } from "../../components/typography";
import Gradient from "../../components/ui/Gradient";
import PopupMessage from "../../components/ui/PopupMessage";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [popup, setPopup] = useState<{
    visible: boolean;
    title?: string;
    message: string;
    type: "error" | "success" | "info";
  }>({ visible: false, message: "", type: "info" });

  const { signIn } = useAuth();

  const showPopup = (
    message: string,
    type: "error" | "success" | "info" = "info",
    title?: string,
  ) => {
    setPopup({ visible: true, message, type, title });
  };

  const hidePopup = () => {
    setPopup((prev) => ({ ...prev, visible: false }));
  };

  const navigateToSignUp = () => {
    router.push("/(tabs)/signUp");
  };

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      showPopup("Please fill in all fields.", "error", "Validation Error");
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)/landingMain");
    } catch (err: any) {
      console.error("Error during login:", err);
      showPopup(err?.message || "Login failed.", "error", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showPopup(
        "Please enter your email address first.",
        "error",
        "Enter Email",
      );
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        showPopup(error.message, "error", "Error");
      } else {
        showPopup(
          "Password reset email sent. Please check your inbox.",
          "success",
          "Email Sent",
        );
      }
    } catch (error: any) {
      showPopup("Password reset email failed to send.", "error", "Error");
    }
  };

  return (
    <View className="flex-1 bg-white justify-center">
      <Gradient />

      {/* MAIN CONTENT */}
      <View
        className="flex-1 w-full h-full items-start justify-center"
        style={{ paddingHorizontal: "6%", zIndex: 1 }}
      >
        <Image
          source={require("../../assets/images/cat_with_pink_ball.png")}
          style={{
            height: Dimensions.get("screen").height * 0.06,
            width: Dimensions.get("screen").width * 0.18,
            marginBottom: 15,
          }}
          resizeMode="contain"
        />

        <H1 baseSize={25} className="text-left mb-[0.5rem]">
          Login
        </H1>
        <H2 baseSize={12} className="text-left mb-[2rem]">
          You&apos;re back, we&apos;ve missed you!
        </H2>

        {/* Email Address */}
        <P>Email Address</P>
        <TextLineInput
          placeholder="JennaSmith@gmail.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* Password */}
        <P className="mt-[1rem]">Password</P>
        <View style={styles.passwordWrapper}>
          <TextLineInput
            placeholder="***********"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={styles.passwordInput}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            activeOpacity={0.7}
          >
            <Image
              className="eyeImage"
              source={require("../../assets/images/eye.png")}
              style={styles.eyeImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
          <View style={{ height: Dimensions.get("window").height * 0.02 }} />

          <P>Forgot password?</P>
        </TouchableOpacity>

        <View style={{ height: Dimensions.get("window").height * 0.06 }} />

        {/* Login Button */}
        <Button
          title={isLoading ? "Signing in..." : "Login"}
          onPress={handleLogin}
          disabled={isLoading}
        />

        <Button
          title={"Don't have an account? Sign Up"}
          onPress={navigateToSignUp}
        />
      </View>

      <PopupMessage
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={hidePopup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  passwordWrapper: {
    position: "relative",
    width: "100%",
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 0,
    top: 8,
    padding: 4,
  },
  eyeImage: {
    width: 24,
    height: 24,
    paddingBottom: 8,
  },
});
