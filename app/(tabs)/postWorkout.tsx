import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Button } from "../../components/typography";

interface WorkoutStat {
  label: string;
  value: string;
  visible: boolean;
}

interface WorkoutData {
  workoutName: string;
  duration: number;
  exercises: number;
  sets: number;
  totalReps: number;
  weightLifted: number;
}

export default function PostWorkout() {
  const params = useLocalSearchParams();
  const workoutDataParam = params.workoutData as string;

  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [stats, setStats] = useState<WorkoutStat[]>([]);

  useEffect(() => {
    if (workoutDataParam) {
      try {
        const data: WorkoutData = JSON.parse(workoutDataParam);

        // Format duration
        const hours = Math.floor(data.duration / 3600);
        const minutes = Math.floor((data.duration % 3600) / 60);
        const durationStr =
          hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;

        // Set stats from workout data
        setStats([
          { label: "Duration", value: durationStr, visible: true },
          {
            label: "Exercises",
            value: data.exercises.toString(),
            visible: true,
          },
          { label: "Sets", value: data.sets.toString(), visible: true },
          {
            label: "Total Reps",
            value: data.totalReps.toString(),
            visible: true,
          },
          {
            label: "Weight Lifted",
            value: `${data.weightLifted.toLocaleString()} lbs`,
            visible: true,
          },
        ]);

        // Set default description
        setDescription(`Completed ${data.workoutName}! 💪`);
      } catch (error) {
        console.error("Error parsing workout data:", error);
        // Fallback to default stats
        setStats([
          { label: "Duration", value: "45 min", visible: true },
          { label: "Exercises", value: "8", visible: true },
          { label: "Sets", value: "24", visible: true },
          { label: "Total Reps", value: "180", visible: true },
          { label: "Weight Lifted", value: "2,500 lbs", visible: true },
        ]);
      }
    } else {
      // Default stats if no data passed
      setStats([
        { label: "Duration", value: "45 min", visible: true },
        { label: "Exercises", value: "8", visible: true },
        { label: "Sets", value: "24", visible: true },
        { label: "Total Reps", value: "180", visible: true },
        { label: "Weight Lifted", value: "2,500 lbs", visible: true },
      ]);
    }
  }, [workoutDataParam]);

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      console.log("Photo library permission denied");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      console.log("Camera permission denied");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const toggleStatVisibility = (index: number) => {
    const updatedStats = [...stats];
    updatedStats[index].visible = !updatedStats[index].visible;
    setStats(updatedStats);
  };

  const handlePost = () => {
    // Handle posting workout
    console.log("Posting workout:", { description, imageUri, stats });
    router.push("/(tabs)/landingMain");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <h1 style={styles.title}>Share Your Workout</h1>

        {/* Description Input */}
        <View style={styles.section}>
          <h3 style={styles.sectionTitle}>Description</h3>
          <TextInput
            style={styles.textInput}
            placeholder="How did your workout go?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Photo Selection */}
        <View style={styles.section}>
          <h3 style={styles.sectionTitle}>Photo</h3>
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setImageUri(null)}
              >
                <span style={styles.removeButtonText}>✕</span>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <Button title="Take Photo" onPress={takePhoto} />
              <Button
                title="Choose from Gallery"
                onPress={pickImageFromGallery}
              />
            </View>
          )}
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <h3 style={styles.sectionTitle}>Workout Stats (tap to hide/show)</h3>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.statBox, !stat.visible && styles.statBoxHidden]}
                onPress={() => toggleStatVisibility(index)}
              >
                {!stat.visible && (
                  <View style={styles.xOverlay}>
                    <span style={styles.xText}>✕</span>
                  </View>
                )}
                <p style={styles.statLabel}>{stat.label}</p>
                <p style={styles.statValue}>{stat.value}</p>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Button title="Post Workout" onPress={handlePost} />
          <Button title="Cancel" onPress={() => router.back()} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  photoButtons: {
    gap: 10,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statBox: {
    width: "48%",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    position: "relative",
  },
  statBoxHidden: {
    opacity: 0.4,
  },
  xOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  xText: {
    fontSize: 40,
    color: "#ff0000",
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  submitSection: {
    gap: 10,
    marginTop: 20,
    marginBottom: 40,
  },
});
