import { supabase, Recommendation, WatchlistItem, FriendItem, UserProfile } from "./supabase";

/**
 * Check if a username is available in Supabase profiles table
 */
export async function checkUsernameAvailable(
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername) return false;

  try {
    let query = supabase
      .from("profiles")
      .select("id")
      .eq("username", cleanUsername);

    if (excludeUserId) {
      query = query.neq("id", excludeUserId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error checking username availability:", error);
      return true;
    }
    return !data || data.length === 0;
  } catch (err) {
    console.error("Error checking username availability:", err);
    return true;
  }
}

/**
 * Create a mutual two-way friendship in Supabase
 */
export async function addLiveFriendship(userA: string, userB: string): Promise<boolean> {
  const cleanA = userA.trim().toLowerCase();
  const cleanB = userB.trim().toLowerCase();
  if (!cleanA || !cleanB || cleanA === cleanB) return false;

  try {
    const { error } = await supabase.from("friendships").upsert(
      [
        { username: cleanA, friend_username: cleanB, status: "ACCEPTED" },
        { username: cleanB, friend_username: cleanA, status: "ACCEPTED" },
      ],
      { onConflict: "username,friend_username" }
    );

    if (error) {
      console.error("Error creating friendship in Supabase:", error);
    }
    return true;
  } catch (err) {
    console.error("Error in addLiveFriendship:", err);
    return false;
  }
}

/**
 * Fetch all confirmed friends for a given username from Supabase
 */
export async function fetchLiveFriends(username: string): Promise<FriendItem[]> {
  const cleanUser = username.trim().toLowerCase();
  if (!cleanUser) return [];

  try {
    const { data: friendships, error } = await supabase
      .from("friendships")
      .select("friend_username, status")
      .eq("username", cleanUser);

    if (error || !friendships || friendships.length === 0) return [];

    const friendUsernames = friendships.map((f: any) => f.friend_username);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("username", friendUsernames);

    if (!profiles || profiles.length === 0) return [];

    return profiles.map((p: any) => ({
      id: p.id || p.username,
      username: p.username,
      display_name: p.display_name || p.username,
      avatar_character_id: p.avatar_character_id || "tony_stark",
      status: "ACCEPTED",
      stats: {
        recommendedCount: 3,
        watchedCount: 12,
        topGenre: "Sci-Fi",
      },
    }));
  } catch (err) {
    console.error("Error fetching live friends:", err);
    return [];
  }
}

/**
 * Fetch a user profile by user UUID from Supabase profiles table
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as UserProfile;
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return null;
  }
}

/**
 * Upsert user profile
 */
export async function upsertUserProfile(profile: {
  id: string;
  username: string;
  display_name: string;
  avatar_character_id: string;
  age?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from("profiles").upsert(
      {
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        avatar_character_id: profile.avatar_character_id,
        age: profile.age,
      },
      { onConflict: "id" }
    );
    if (error) {
      console.error("Error saving profile to Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error upserting user profile:", err);
    return false;
  }
}

/**
 * Fetch all circle recommendations from Supabase
 */
export async function fetchLiveRecommendations(): Promise<Recommendation[]> {
  try {
    const { data, error } = await supabase
      .from("recommendations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: String(row.id),
      sender_name: row.sender_name || "Friend",
      sender_avatar: row.sender_avatar || "tony_stark",
      recipient: row.recipient || "All Friends",
      tmdb_id: row.tmdb_id,
      media_type: (row.media_type as "movie" | "tv") || "movie",
      title: row.title,
      poster_path: row.poster_path,
      backdrop_path: row.backdrop_path,
      release_year: row.release_year || "2024",
      genre: row.genre || "Featured",
      rating_stars: Number(row.rating_stars) || 5.0,
      note: row.note || "",
      tags: Array.isArray(row.tags) ? row.tags : ["MustWatch"],
      created_at: row.created_at,
    }));
  } catch (err) {
    console.error("Error fetching live recommendations:", err);
    return [];
  }
}

/**
 * Insert a new recommendation to Supabase
 */
export async function createLiveRecommendation(rec: {
  senderId?: string;
  senderName: string;
  senderAvatar: string;
  recipient: string;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
  releaseYear?: string;
  genre?: string;
  ratingStars: number;
  note: string;
  tags: string[];
}): Promise<Recommendation | null> {
  try {
    const insertPayload: any = {
      tmdb_id: rec.tmdbId,
      media_type: rec.mediaType,
      title: rec.title,
      poster_path: rec.posterPath,
      backdrop_path: rec.backdropPath,
      release_year: rec.releaseYear || "2024",
      genre: rec.genre || "Featured",
      rating_stars: rec.ratingStars,
      note: rec.note,
      tags: rec.tags,
      sender_name: rec.senderName,
      sender_avatar: rec.senderAvatar,
      recipient: rec.recipient,
    };

    if (rec.senderId) {
      insertPayload.sender_id = rec.senderId;
    }

    const { data, error } = await supabase
      .from("recommendations")
      .insert([insertPayload])
      .select()
      .single();

    if (error || !data) {
      console.error("Error inserting live recommendation:", error);
      return null;
    }

    return {
      id: String(data.id),
      sender_name: data.sender_name,
      sender_avatar: data.sender_avatar,
      recipient: data.recipient,
      tmdb_id: data.tmdb_id,
      media_type: data.media_type,
      title: data.title,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      release_year: data.release_year,
      genre: data.genre,
      rating_stars: Number(data.rating_stars),
      note: data.note,
      tags: data.tags,
      created_at: data.created_at,
    };
  } catch (err) {
    console.error("Error creating live recommendation:", err);
    return null;
  }
}

/**
 * Delete a recommendation from Supabase
 */
export async function deleteLiveRecommendation(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("recommendations").delete().eq("id", id);
    if (error) {
      console.error("Error deleting recommendation:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error in deleteLiveRecommendation:", err);
    return false;
  }
}

/**
 * Fetch user watchlist from Supabase
 */
export async function fetchLiveWatchlist(userId?: string): Promise<WatchlistItem[]> {
  try {
    let query = supabase.from("watchlist").select("*").order("created_at", { ascending: false });
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((row: any) => ({
      id: String(row.id),
      tmdb_id: row.tmdb_id,
      media_type: (row.media_type as "movie" | "tv") || "movie",
      title: row.title,
      poster_path: row.poster_path,
      release_year: row.release_year || "2024",
      genre: row.genre || "Featured",
      status: (row.status as "WANT_TO_WATCH" | "WATCHED") || "WANT_TO_WATCH",
      rating_stars: row.rating_stars ? Number(row.rating_stars) : undefined,
      recommended_by: row.recommended_by || undefined,
      added_at: row.created_at,
    }));
  } catch (err) {
    console.error("Error fetching live watchlist:", err);
    return [];
  }
}

/**
 * Add an item to Supabase watchlist
 */
export async function addLiveWatchlistItem(item: {
  userId?: string;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseYear?: string;
  genre?: string;
  status: "WANT_TO_WATCH" | "WATCHED";
  ratingStars?: number;
  recommendedBy?: string;
}): Promise<WatchlistItem | null> {
  try {
    const payload: any = {
      tmdb_id: item.tmdbId,
      media_type: item.mediaType,
      title: item.title,
      poster_path: item.posterPath,
      release_year: item.releaseYear || "2024",
      genre: item.genre || "Featured",
      status: item.status,
      rating_stars: item.ratingStars || null,
      recommended_by: item.recommendedBy || null,
    };

    if (item.userId) {
      payload.user_id = item.userId;
    }

    const { data, error } = await supabase.from("watchlist").insert([payload]).select().single();
    if (error || !data) {
      console.error("Error adding to watchlist in Supabase:", error);
      return null;
    }

    return {
      id: String(data.id),
      tmdb_id: data.tmdb_id,
      media_type: data.media_type,
      title: data.title,
      poster_path: data.poster_path,
      release_year: data.release_year,
      genre: data.genre,
      status: data.status,
      rating_stars: data.rating_stars ? Number(data.rating_stars) : undefined,
      recommended_by: data.recommended_by,
      added_at: data.created_at,
    };
  } catch (err) {
    console.error("Error in addLiveWatchlistItem:", err);
    return null;
  }
}

/**
 * Remove an item from Supabase watchlist
 */
export async function removeLiveWatchlistItem(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("watchlist").delete().eq("id", id);
    if (error) {
      console.error("Error removing watchlist item:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error in removeLiveWatchlistItem:", err);
    return false;
  }
}

/**
 * Update watchlist item status / rating
 */
export async function updateLiveWatchlistItem(
  id: string,
  updates: { status?: "WANT_TO_WATCH" | "WATCHED"; rating_stars?: number }
): Promise<boolean> {
  try {
    const { error } = await supabase.from("watchlist").update(updates).eq("id", id);
    if (error) {
      console.error("Error updating watchlist item:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error in updateLiveWatchlistItem:", err);
    return false;
  }
}

/**
 * Realtime WebSocket Subscription: Listen for live recommendations across friends
 */
export function subscribeToRecommendations(
  onInsert: (rec: Recommendation) => void,
  onDelete: (id: string) => void
) {
  const channel = supabase
    .channel("realtime_recommendations")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "recommendations" },
      (payload) => {
        const row = payload.new as any;
        const rec: Recommendation = {
          id: String(row.id),
          sender_name: row.sender_name || "Friend",
          sender_avatar: row.sender_avatar || "tony_stark",
          recipient: row.recipient || "All Friends",
          tmdb_id: row.tmdb_id,
          media_type: (row.media_type as "movie" | "tv") || "movie",
          title: row.title,
          poster_path: row.poster_path,
          backdrop_path: row.backdrop_path,
          release_year: row.release_year || "2024",
          genre: row.genre || "Featured",
          rating_stars: Number(row.rating_stars) || 5.0,
          note: row.note || "",
          tags: Array.isArray(row.tags) ? row.tags : ["MustWatch"],
          created_at: row.created_at,
        };
        onInsert(rec);
      }
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "recommendations" },
      (payload) => {
        if (payload.old && payload.old.id) {
          onDelete(String(payload.old.id));
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Realtime WebSocket Subscription: Listen for live comments on a recommendation
 */
export function subscribeToComments(
  recommendationId: string,
  onInsert: (comment: any) => void
) {
  const channel = supabase
    .channel(`realtime_comments_${recommendationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "recommendation_comments",
        filter: `recommendation_id=eq.${recommendationId}`,
      },
      (payload) => {
        const row = payload.new as any;
        onInsert({
          id: String(row.id),
          recommendation_id: row.recommendation_id,
          tmdb_id: row.tmdb_id,
          author_name: row.author_name,
          author_avatar: row.author_avatar,
          comment_text: row.comment_text,
          created_at: row.created_at,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

