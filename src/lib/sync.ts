import { supabase, Recommendation, WatchlistItem, FriendItem, UserProfile } from "./supabase";
import { DEFAULT_AVATAR_ID } from "@/constants/avatars";

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

export interface FriendRequestItem {
  id: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  senderAvatarId: string;
  createdAt: string;
}

export interface OutgoingFriendRequestItem {
  id: string;
  recipientId: string;
  recipientUsername: string;
  recipientDisplayName: string;
  recipientAvatarId: string;
  createdAt: string;
}

/**
 * Find user profile by username handle (case-insensitive)
 */
export async function findProfileByUsername(username: string): Promise<UserProfile | null> {
  const clean = username.trim().replace(/^@/, "").toLowerCase();
  if (!clean) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", clean)
      .maybeSingle();

    if (error || !data) return null;
    return data as UserProfile;
  } catch (err) {
    console.error("Error finding profile by username:", err);
    return null;
  }
}

/**
 * Send a friend request to a user by username handle
 */
export async function sendFriendRequest(
  requesterId: string,
  targetUsername: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  const clean = targetUsername.trim().replace(/^@/, "").toLowerCase();
  if (!clean) return { success: false, error: "Please enter a username" };

  // 1. Verify target user exists in Supabase profiles
  const target = await findProfileByUsername(clean);
  if (!target) {
    return { success: false, error: `No CineCircle user found with handle @${clean}` };
  }

  // 2. Prevent self-friending
  if (target.id === requesterId) {
    return { success: false, error: "You cannot send a friend request to yourself!" };
  }

  try {
    // 3. Check existing relationship
    const { data: existing } = await supabase
      .from("friendships")
      .select("*")
      .or(
        `and(user_id.eq.${requesterId},friend_id.eq.${target.id}),and(user_id.eq.${target.id},friend_id.eq.${requesterId})`
      );

    if (existing && existing.length > 0) {
      const direct = existing.find((f: any) => f.user_id === requesterId && f.friend_id === target.id);
      const reverse = existing.find((f: any) => f.user_id === target.id && f.friend_id === requesterId);

      if (direct?.status === "ACCEPTED" || reverse?.status === "ACCEPTED") {
        return { success: false, error: `@${target.username} is already in your circle!` };
      }
      if (direct?.status === "PENDING") {
        return { success: false, error: `Friend request to @${target.username} is already pending approval.` };
      }
      if (reverse?.status === "PENDING") {
        await acceptFriendRequest(reverse.id, target.id, requesterId);
        return { success: true, message: `Mutual connection accepted! You and @${target.username} are now friends!` };
      }
    }

    // 4. Insert pending request
    const { error } = await supabase.from("friendships").insert([
      {
        user_id: requesterId,
        friend_id: target.id,
        status: "PENDING",
      },
    ]);

    if (error) {
      console.error("Error sending friend request:", error);
      return { success: false, error: error.message || "Failed to send friend request" };
    }

    return { success: true, message: `Friend request sent to @${target.username}! Awaiting their approval.` };
  } catch (err: any) {
    console.error("Error in sendFriendRequest:", err);
    return { success: false, error: err?.message || "An unexpected error occurred" };
  }
}

/**
 * Fetch pending incoming friend requests for current user
 */
export async function fetchIncomingFriendRequests(currentUserId: string): Promise<FriendRequestItem[]> {
  if (!currentUserId) return [];
  try {
    const { data, error } = await supabase
      .from("friendships")
      .select("id, user_id, created_at")
      .eq("friend_id", currentUserId)
      .eq("status", "PENDING");

    if (error || !data || data.length === 0) return [];

    const senderIds = data.map((row: any) => row.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", senderIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    return data.map((row: any) => {
      const prof = profileMap.get(row.user_id);
      return {
        id: row.id,
        senderId: row.user_id,
        senderUsername: prof?.username || "user",
        senderDisplayName: prof?.display_name || prof?.username || "A Cinephile",
        senderAvatarId: prof?.avatar_character_id || DEFAULT_AVATAR_ID,
        createdAt: row.created_at,
      };
    });
  } catch (err) {
    console.error("Error fetching incoming friend requests:", err);
    return [];
  }
}

/**
 * Fetch pending outgoing friend requests sent by current user
 */
export async function fetchOutgoingFriendRequests(currentUserId: string): Promise<OutgoingFriendRequestItem[]> {
  if (!currentUserId) return [];
  try {
    const { data, error } = await supabase
      .from("friendships")
      .select("id, friend_id, created_at")
      .eq("user_id", currentUserId)
      .eq("status", "PENDING");

    if (error || !data || data.length === 0) return [];

    const recipientIds = data.map((row: any) => row.friend_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", recipientIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    return data.map((row: any) => {
      const prof = profileMap.get(row.friend_id);
      return {
        id: row.id,
        recipientId: row.friend_id,
        recipientUsername: prof?.username || "user",
        recipientDisplayName: prof?.display_name || prof?.username || "User",
        recipientAvatarId: prof?.avatar_character_id || DEFAULT_AVATAR_ID,
        createdAt: row.created_at,
      };
    });
  } catch (err) {
    console.error("Error fetching outgoing friend requests:", err);
    return [];
  }
}

/**
 * Accept / Approve an incoming friend request
 */
export async function acceptFriendRequest(
  requestId: string,
  requesterId: string,
  currentUserId: string
): Promise<boolean> {
  try {
    // 1. Update original row to ACCEPTED
    await supabase.from("friendships").update({ status: "ACCEPTED" }).eq("id", requestId);

    // 2. Ensure reciprocal row exists so both users see each other
    await supabase.from("friendships").upsert(
      [
        { user_id: currentUserId, friend_id: requesterId, status: "ACCEPTED" },
        { user_id: requesterId, friend_id: currentUserId, status: "ACCEPTED" },
      ],
      { onConflict: "user_id,friend_id" }
    );

    return true;
  } catch (err) {
    console.error("Error accepting friend request:", err);
    return false;
  }
}

/**
 * Decline / Disapprove a friend request
 */
export async function declineFriendRequest(requestId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("friendships").delete().eq("id", requestId);
    return !error;
  } catch (err) {
    console.error("Error declining friend request:", err);
    return false;
  }
}

/**
 * Create a mutual two-way friendship in Supabase (e.g. for invite links)
 */
export async function addLiveFriendship(userAIdOrUsername: string, userBIdOrUsername: string): Promise<boolean> {
  try {
    const [profA, profB] = await Promise.all([
      userAIdOrUsername.includes("-") ? fetchUserProfile(userAIdOrUsername) : findProfileByUsername(userAIdOrUsername),
      userBIdOrUsername.includes("-") ? fetchUserProfile(userBIdOrUsername) : findProfileByUsername(userBIdOrUsername),
    ]);

    if (!profA || !profB || profA.id === profB.id) return false;

    await supabase.from("friendships").upsert(
      [
        { user_id: profA.id, friend_id: profB.id, status: "ACCEPTED" },
        { user_id: profB.id, friend_id: profA.id, status: "ACCEPTED" },
      ],
      { onConflict: "user_id,friend_id" }
    );
    return true;
  } catch (err) {
    console.error("Error in addLiveFriendship:", err);
    return false;
  }
}

/**
 * Fetch all confirmed friends for a given user ID or username from Supabase
 */
export async function fetchLiveFriends(userIdOrUsername: string): Promise<FriendItem[]> {
  const clean = userIdOrUsername.trim().toLowerCase();
  if (!clean) return [];

  try {
    let targetUserId = clean;
    if (!clean.includes("-")) {
      const p = await findProfileByUsername(clean);
      if (!p) return [];
      targetUserId = p.id;
    }

    const { data: friendships, error } = await supabase
      .from("friendships")
      .select("friend_id, status")
      .eq("user_id", targetUserId)
      .eq("status", "ACCEPTED");

    if (error || !friendships || friendships.length === 0) return [];

    const friendIds = friendships.map((f: any) => f.friend_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", friendIds);

    if (!profiles || profiles.length === 0) return [];

    return profiles.map((p: any) => ({
      id: p.id,
      username: p.username,
      display_name: p.display_name || p.username,
      avatar_character_id: p.avatar_character_id || DEFAULT_AVATAR_ID,
      status: "ACCEPTED",
      stats: {
        recommendedCount: 2,
        watchedCount: 8,
        topGenre: "Cinema",
      },
    }));
  } catch (err) {
    console.error("Error fetching live friends:", err);
    return [];
  }
}

/**
 * Fetch a friend's shared watchlist
 */
export async function fetchFriendWatchlist(friendUserId: string): Promise<WatchlistItem[]> {
  return fetchLiveWatchlist(friendUserId);
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
      sender_avatar: row.sender_avatar || DEFAULT_AVATAR_ID,
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
      status: (row.status as "WANT_TO_WATCH" | "CURRENTLY_WATCHING" | "WATCHED") || "WANT_TO_WATCH",
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
  status: "WANT_TO_WATCH" | "CURRENTLY_WATCHING" | "WATCHED";
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
  updates: { status?: "WANT_TO_WATCH" | "CURRENTLY_WATCHING" | "WATCHED"; rating_stars?: number }
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
          sender_avatar: row.sender_avatar || DEFAULT_AVATAR_ID,
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

