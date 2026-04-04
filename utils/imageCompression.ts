import * as ImageManipulator from "expo-image-manipulator";

export const uriToBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`);
  const blob = await response.blob();
  return blob;
};

export const compressImage = async (
  uri: string,
  maxFileSize: number,
  initialWidth: number,
): Promise<string | null> => {
  try {
    let quality = 0.8;
    let width = initialWidth;

    // Iteratively compress until under maxFileSize
    for (let attempt = 0; attempt < 5; attempt++) {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG },
      );

      const blob = await uriToBlob(manipResult.uri);
      const fileSize = blob.size;

      if (fileSize <= maxFileSize) {
        return manipResult.uri;
      }

      // Reduce quality and size more aggressively
      quality = Math.max(0.1, quality - 0.15);
      width = Math.max(200, Math.floor(width * 0.7));
    }

    // If still too large after 5 attempts, warn user
    console.log(
      "Image too large",
      "Unable to compress image below limit. Please try a different image or take a new photo.",
    );
    return null;
  } catch (error) {
    console.error("Error compressing image:", error);
    console.log(
      "Compression failed",
      "Failed to process image. Please try again.",
    );
    return null;
  }
};
