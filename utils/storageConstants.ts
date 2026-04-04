// Supabase storage configuration constants
export const STORAGE_BUCKETS = {
  PROFILE_IMAGES: "profile-images",
  POST_IMAGES: "post-images",
} as const;

export const MAX_FILE_SIZE = 50 * 1024; // 50 KB
export const SIGNED_URL_EXPIRY = 3600; // 1 hour
