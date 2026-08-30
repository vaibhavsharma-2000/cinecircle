import { createClient } from "@supabase/supabase-js";

let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
if (rawUrl.includes("supabase.com/dashboard/project/")) {
  const parts = rawUrl.split("supabase.com/dashboard/project/");
  if (parts[1]) {
    const projectRef = parts[1].replace(/\/$/, "");
    rawUrl = `https://${projectRef}.supabase.co`;
  }
}

const supabaseUrl = rawUrl || "https://pkjzqtffppneqjyejbzj.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "cinecircle_auth_session",
  },
});

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  age?: number;
  avatar_character_id: string;
  bio?: string;
  top_movies?: number[];
}

export interface Recommendation {
  id: string;
  sender_name: string;
  sender_avatar: string;
  recipient: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_year: string;
  genre: string;
  rating_stars: number;
  note: string;
  tags: string[];
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  release_year: string;
  genre: string;
  status: "WANT_TO_WATCH" | "CURRENTLY_WATCHING" | "WATCHED";
  rating_stars?: number;
  recommended_by?: string;
  added_at: string;
}

export interface FriendItem {
  id: string;
  username: string;
  display_name: string;
  avatar_character_id: string;
  status: "ACCEPTED" | "PENDING";
  stats: {
    recommendedCount: number;
    watchedCount: number;
    topGenre: string;
  };
}

export interface RecommendationComment {
  id: string;
  recommendation_id: string;
  tmdb_id?: number;
  author_name: string;
  author_avatar?: string;
  comment_text: string;
  created_at: string;
}
