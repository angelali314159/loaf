import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import PopupMessage from "../../components/PopupMessage";
import { Button, H3, P } from "../../components/typography";
import { useAuth } from "../../contexts/AuthContext";
import { compressImage } from "../../utils/imageCompression";
import { MAX_FILE_SIZE, STORAGE_BUCKETS } from "../../utils/storageConstants";
import { supabase } from "../../utils/supabase";
import {
  getSignedImageUrl,
  uploadProfileImage,
} from "../../utils/supabaseStorage";

export default function Settings() {
  const { signOut, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showError, setShowError] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [messagePopup, setMessagePopup] = useState<{
    visible: boolean;
    title?: string;
    message: string;
    type: "error" | "success" | "info";
  }>({
    visible: false,
    title: undefined,
    message: "",
    type: "info",
  });

  const openMessagePopup = (
    message: string,
    type: "error" | "success" | "info" = "info",
    title?: string,
  ) => {
    setMessagePopup({
      visible: true,
      title,
      message,
      type,
    });
  };

  useEffect(() => {
    if (user?.id) {
      fetchProfileImage();
    }
  }, [user?.id]);

  const fetchProfileImage = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("profile_image_url")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data?.profile_image_url) {
        const signedUrl = await getSignedImageUrl(
          data.profile_image_url,
          STORAGE_BUCKETS.PROFILE_IMAGES,
        );
        if (signedUrl) {
          setProfileImageUri(signedUrl);
        }
      }
    } catch (error) {
      console.error("Error fetching profile image:", error);
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      openMessagePopup(
        "Please grant photo library access",
        "error",
        "Permission needed",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile picture
      quality: 0.8,
    });

    if (!result.canceled) {
      const compressedUri = await compressImage(
        result.assets[0].uri,
        MAX_FILE_SIZE,
        512,
      );
      if (compressedUri) {
        await handleImageUpload(compressedUri);
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      openMessagePopup(
        "Please grant camera access",
        "error",
        "Permission needed",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile picture
      quality: 0.8,
    });

    if (!result.canceled) {
      const compressedUri = await compressImage(
        result.assets[0].uri,
        MAX_FILE_SIZE,
        512,
      );
      if (compressedUri) {
        await handleImageUpload(compressedUri);
      }
    }
  };

  const handleImageUpload = async (uri: string) => {
    if (!user?.id) return;

    try {
      setIsUploading(true);

      // Read file and convert to base64
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        openMessagePopup("Image file is empty. Please try again.", "error");
        return;
      }

      if (blob.size > MAX_FILE_SIZE) {
        openMessagePopup(
          `Image is ${Math.round(blob.size / 1024)} KB, must be under 50 KB`,
          "error",
          "File too large",
        );
        return;
      }

      // Convert blob to base64
      const reader = new FileReader();

      const uploadResult = await new Promise<{
        filePath: string;
        signedUrl: string | null;
      } | null>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64String = (reader.result as string).split(",")[1];
            const result = await uploadProfileImage(base64String, user.id);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => {
          reject(new Error("Failed to read image file"));
        };

        reader.readAsDataURL(blob);
      });

      if (!uploadResult?.filePath) {
        openMessagePopup(
          "Failed to upload profile picture.",
          "error",
          "Upload failed",
        );
        return;
      }

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ profile_image_url: uploadResult.filePath })
        .eq("id", user.id);

      if (profileUpdateError) {
        console.error("Error updating profile image path:", profileUpdateError);
        openMessagePopup(
          "Image uploaded but failed to save profile.",
          "error",
          "Update failed",
        );
        return;
      }

      if (uploadResult.signedUrl) {
        setProfileImageUri(uploadResult.signedUrl);
        openMessagePopup("Profile picture updated!", "success", "Success");
      } else {
        await fetchProfileImage();
        openMessagePopup("Profile picture updated!", "success", "Success");
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      openMessagePopup(
        "Failed to upload profile picture.",
        "error",
        "Upload failed",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = async () => {
    setShowConfirm(false);
    try {
      setIsLoggingOut(true);
      await signOut();
      router.replace("/(tabs)/welcome");
    } catch (error) {
      console.error("Error logging out:", error);
      setShowError(true);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* SEMICIRCLE GRADIENT BACKGROUND */}
      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 0 }}
      >
        <Svg
          height={Dimensions.get("screen").height * 0.5}
          width={Dimensions.get("screen").width}
        >
          <Defs>
            <RadialGradient
              id="topSemiCircle"
              cx="50%" //centered horizontally
              cy="0%" //top edge
              rx="150%" //horiztonal radius
              ry="70%" //vertical radius
              gradientUnits="objectBoundingBox"
            >
              <Stop offset="0%" stopColor="#FCDE8C" stopOpacity={0.9} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.1} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#topSemiCircle)" />
        </Svg>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <H3 baseSize={24}>Settings</H3>
        </View>

        {/* Profile Picture Section */}
        <View className="px-6 mt-4 justify-center">
          <H3 className="mb-4">Profile Picture</H3>

          {/* Current Profile Picture */}
          {profileImageUri && (
            <View className="items-center mb-4">
              <Image
                source={{ uri: profileImageUri }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 2,
                  borderColor: "#FCDE8C",
                }}
                resizeMode="cover"
              />
            </View>
          )}
          <Text className="text-center mb-4">Update Profile Picture</Text>
          {/* Upload Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={takePhoto}
              disabled={isUploading}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#B1B0B0",
                borderRadius: 8,
                padding: 16,
                alignItems: "center",
                opacity: isUploading ? 0.5 : 1,
              }}
            >
              <Feather name="camera" size={24} color="#09090B" />
              <P className="mt-2 text-center">Take Photo</P>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickImageFromGallery}
              disabled={isUploading}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#B1B0B0",
                borderRadius: 8,
                padding: 16,
                alignItems: "center",
                opacity: isUploading ? 0.5 : 1,
              }}
            >
              <Feather name="image" size={24} color="#09090B" />
              <P className="mt-2 text-center">Photo Gallery</P>
            </TouchableOpacity>
          </View>

          {isUploading && (
            <P className="text-center mt-3 text-[#565656]">
              Uploading profile picture...
            </P>
          )}
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: "#DADADA",
            marginTop: 24,
            marginBottom: 24,
            marginHorizontal: 24,
          }}
        />

        {/* Logout Button */}
        <View className="px-6 mt-4">
          <Button
            title={isLoggingOut ? "Logging out..." : "Logout"}
            onPress={handleLogout}
            color="blue"
            fontColor="yellow"
            disabled={isLoggingOut}
          />
        </View>
      </ScrollView>

      <PopupMessage
        visible={showConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        type="info"
        confirmText="Logout"
        onClose={confirmLogout}
        secondaryAction={{
          text: "Cancel",
          onPress: () => setShowConfirm(false),
        }}
      />

      <PopupMessage
        visible={showError}
        title="Error"
        message="Failed to logout. Please try again."
        type="error"
        onClose={() => setShowError(false)}
      />

      <PopupMessage
        visible={messagePopup.visible}
        title={messagePopup.title}
        message={messagePopup.message}
        type={messagePopup.type}
        onClose={() =>
          setMessagePopup((prev) => ({
            ...prev,
            visible: false,
          }))
        }
      />
    </View>
  );
}
