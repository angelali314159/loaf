import { decode } from "base64-arraybuffer";
import { SIGNED_URL_EXPIRY, STORAGE_BUCKETS } from "./storageConstants";
import { supabase } from "./supabase";

/**
 * Parse image storage path, handling both full paths and just filenames
 */
const parseImagePath = (imagePath: string, bucket: string): string => {
  if (!imagePath) return "";
  const bucketPrefix = `${bucket}/`;
  return imagePath.includes(bucketPrefix)
    ? imagePath.split(bucketPrefix)[1]
    : imagePath;
};

/**
 * Get signed URL for a stored image (valid for 1 hour)
 */
export const getSignedImageUrl = async (
  imagePath: string,
  bucket: string,
): Promise<string | null> => {
  if (!imagePath) return null;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return null;

    const path = parseImagePath(imagePath, bucket);

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, SIGNED_URL_EXPIRY);

    if (error) {
      console.error("Error getting signed URL:", error);
      return null;
    }

    return data?.signedUrl || null;
  } catch (error) {
    console.error("Error in getSignedImageUrl:", error);
    return null;
  }
};

/**
 * Upload image to Supabase storage and update database profile
 */
export const uploadProfileImage = async (
  base64String: string,
  userId: string,
): Promise<{ filePath: string; signedUrl: string | null } | null> => {
  if (!userId) return null;

  try {
    const filename = `${userId}-${Date.now()}.jpg`;
    const filePath = `${userId}/${filename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.PROFILE_IMAGES)
      .upload(filePath, decode(base64String), {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Update profile with new image path
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ profile_image_url: filePath })
      .eq("id", userId);

    if (updateError) throw updateError;

    // Get signed URL for display
    const signedUrl = await getSignedImageUrl(
      filePath,
      STORAGE_BUCKETS.PROFILE_IMAGES,
    );

    return { filePath, signedUrl };
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
};

/**
 * Batch fetch signed URLs for multiple images (parallel)
 */
export const getSignedImageUrls = async (
  imagePaths: string[],
  bucket: string,
): Promise<Map<string, string | null>> => {
  const urlMap = new Map<string, string | null>();

  // Fetch all URLs in parallel
  const results = await Promise.all(
    imagePaths.map((path) => getSignedImageUrl(path, bucket)),
  );

  // Map results back to original paths
  imagePaths.forEach((path, index) => {
    urlMap.set(path, results[index]);
  });

  return urlMap;
};
