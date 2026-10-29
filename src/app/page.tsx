"use client";

import { useState, useEffect, useRef } from "react";
import type { Session } from "@supabase/supabase-js";
import { Navbar } from "@/components/Navbar";
import { DiscoverView } from "@/components/DiscoverView";
import { RecommendationsView } from "@/components/RecommendationsView";
import { WatchlistView } from "@/components/WatchlistView";
import { GroupMatcherView } from "@/components/GroupMatcherView";
import { FriendsView } from "@/components/FriendsView";
import { TrailerModal } from "@/components/TrailerModal";
import { RecommendModal } from "@/components/RecommendModal";
import { AccountModal } from "@/components/AccountModal";
import { MovieDetailModal } from "@/components/MovieDetailModal";
import { AuthModal, AuthMode } from "@/components/AuthModal";
import { CompleteProfileModal } from "@/components/CompleteProfileModal";
import { CookieConsentModal } from "@/components/CookieConsentModal";
import { InstallPwaModal } from "@/components/InstallPwaModal";
import { InviteModal } from "@/components/InviteModal";
import { FriendLibraryModal } from "@/components/FriendLibraryModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SignInPrompt, GatedTab } from "@/components/SignInPrompt";
import { ToastNotification, ToastItem } from "@/components/ToastNotification";
import { MovieItem, getMovieDetails } from "@/lib/tmdb";
import { Recommendation, WatchlistItem, FriendItem, supabase } from "@/lib/supabase";
import { DEFAULT_AVATAR_ID } from "@/constants/avatars";

import { MOCK_RECOMMENDATIONS, MOCK_FRIENDS } from "@/lib/mockData";

import {
  fetchUserProfile,
  upsertUserProfile,
  addLiveFriendship,
  fetchLiveFriends,
  fetchLiveRecommendations,
  createLiveRecommendation,
  deleteLiveRecommendation,
  fetchLiveWatchlist,
  addLiveWatchlistItem,
  removeLiveWatchlistItem,
  updateLiveWatchlistItem,
  subscribeToRecommendations,
  sendFriendRequest,
  fetchIncomingFriendRequests,
  fetchOutgoingFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  FriendRequestItem,
  OutgoingFriendRequestItem,
} from "@/lib/sync";

// Environment check: Staging / Dev uses mock data; Production starts completely clean
const IS_MOCK_MODE = process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === "true";
const VALID_TABS = ["discover", "recommendations", "watchlist", "matcher", "friends"];
const GATED_TABS: GatedTab[] = ["watchlist", "matcher", "friends"];
const GUEST_PROFILE = { displayName: "Guest", username: "guest", avatarId: DEFAULT_AVATAR_ID, age: "" };

type WatchStatus = "WANT_TO_WATCH" | "CURRENTLY_WATCHING" | "WATCHED";
type PendingAction = (h: {
  watchlist: WatchlistItem[];
  handleToggleWatchlist: (movie: MovieItem) => void;
  handleSetWatchStatus: (movie: MovieItem, status: WatchStatus | "NONE", rating?: number) => void;
}) => void;

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("discover");
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    let dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    try {
      const stored = localStorage.getItem("cinecircle_theme");
      if (stored) dark = stored === "dark";
    } catch (e) {}
    setIsDarkMode(dark);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, []);
  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authProvider, setAuthProvider] = useState<string | null>(null);
  const [syncedUserId, setSyncedUserId] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [friendRecommendations, setFriendRecommendations] = useState<Recommendation[]>(
    IS_MOCK_MODE ? MOCK_RECOMMENDATIONS : []
  );
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [profile, setProfile] = useState(GUEST_PROFILE);
  const isSignedIn = Boolean(userId);

  // Modal States
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: AuthMode }>({ open: false, mode: "SIGN_IN" });
  const [completeProfileModalOpen, setCompleteProfileModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [installPwaModalOpen, setInstallPwaModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [invitedBy, setInvitedBy] = useState<string | null>(null);
  const inviteRef = useRef<string | null>(null);
  const pendingActionRef = useRef<PendingAction | null>(null);
  const syncedUserRef = useRef<string | null>(null);

  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    movieId: number | null;
    mediaType?: "movie" | "tv";
    initialMovie?: MovieItem | null;
    recommendationNote?: string;
    recommendedBy?: string;
    ratingStars?: number;
  }>({
    isOpen: false,
    movieId: null,
  });

  const [trailerModal, setTrailerModal] = useState<{
    isOpen: boolean;
    title: string;
    youtubeKey: string | null;
  }>({
    isOpen: false,
    title: "",
    youtubeKey: null,
  });

  const [recommendModal, setRecommendModal] = useState<{
    isOpen: boolean;
    movie: MovieItem | null;
  }>({
    isOpen: false,
    movie: null,
  });

  const [incomingRequests, setIncomingRequests] = useState<FriendRequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<OutgoingFriendRequestItem[]>([]);
  const [selectedFriendForLibrary, setSelectedFriendForLibrary] = useState<FriendItem | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (toast: Omit<ToastItem, "id">) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [{ id, ...toast }, ...prev]);
  };

  const openAuth = (mode: AuthMode = "SIGN_IN", pendingAction: PendingAction | null = null) => {
    pendingActionRef.current = pendingAction;
    setAuthModal({ open: true, mode });
  };

  const handleTabChange = (newTab: string) => {
    const url = new URL(window.location.href);
    setActiveTab(newTab);
    if ((url.searchParams.get("tab") || "discover") === newTab && !url.searchParams.has("movie")) return;
    url.searchParams.set("tab", newTab);
    url.searchParams.delete("movie");
    url.searchParams.delete("type");
    window.history.pushState({}, "", url.toString());
  };

  const showMovieDetail = (movie: MovieItem, recommendation?: Recommendation) => {
    const resolvedMediaType: "movie" | "tv" =
      recommendation?.media_type || movie.media_type || (movie.first_air_date ? "tv" : "movie");
    setDetailModal({
      isOpen: true,
      movieId: movie.id,
      mediaType: resolvedMediaType,
      initialMovie: { ...movie, media_type: resolvedMediaType },
      recommendationNote: recommendation?.note,
      recommendedBy: recommendation?.sender_name,
      ratingStars: recommendation?.rating_stars,
    });
    return resolvedMediaType;
  };

  // Opening a title adds a history entry so the Back button closes it instead of leaving the app.
  const handleOpenMovieDetail = (movie: MovieItem, recommendation?: Recommendation) => {
    const mediaType = showMovieDetail(movie, recommendation);
    const url = new URL(window.location.href);
    url.searchParams.set("movie", String(movie.id));
    url.searchParams.set("type", mediaType);
    if (window.history.state?.modal) {
      window.history.replaceState({ modal: true }, "", url.toString());
    } else {
      window.history.pushState({ modal: true }, "", url.toString());
    }
  };

  const handleCloseMovieDetail = () => {
    if (window.history.state?.modal) {
      window.history.back();
      return;
    }
    setDetailModal({ isOpen: false, movieId: null });
    const url = new URL(window.location.href);
    url.searchParams.delete("movie");
    url.searchParams.delete("type");
    window.history.replaceState({}, "", url.toString());
  };

  const acceptInvite = async (myUsername: string) => {
    const inviter = inviteRef.current;
    if (!inviter) return;
    inviteRef.current = null;
    setInvitedBy(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("invite");
    window.history.replaceState(window.history.state, "", url.toString());
    if (inviter === myUsername.toLowerCase()) return;
    if (await addLiveFriendship(myUsername, inviter)) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) setFriends(await fetchLiveFriends(session.user.id));
      addToast({ type: "friend", title: "Joined Circle", message: `You and @${inviter} are now friends.` });
    }
  };

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      setActiveTab(tab && VALID_TABS.includes(tab) ? tab : "discover");
      const movieId = Number(params.get("movie"));
      if (movieId) {
        const type = params.get("type") === "tv" ? "tv" : "movie";
        getMovieDetails(movieId, type).then((fetched) => fetched && showMovieDetail(fetched));
      } else {
        setDetailModal({ isOpen: false, movieId: null });
      }
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);

    const params = new URLSearchParams(window.location.search);
    const inviteUser = params.get("invite")?.trim().replace(/^@/, "").toLowerCase();
    if (inviteUser) {
      inviteRef.current = inviteUser;
      setInvitedBy(inviteUser);
    }
    if (params.get("auth") === "forgot") {
      setAuthModal({ open: true, mode: "FORGOT" });
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      window.history.replaceState({}, "", url.toString());
    }

    const syncUserSession = async (session: Session | null) => {
      fetchLiveRecommendations().then((recs) =>
        setFriendRecommendations(recs.length > 0 ? recs : IS_MOCK_MODE ? MOCK_RECOMMENDATIONS : [])
      );

      if (!session?.user) {
        syncedUserRef.current = null;
        setUserId(null);
        setUserEmail(null);
        setAuthProvider(null);
        setSyncedUserId(null);
        setIncomingRequests([]);
        setOutgoingRequests([]);
        setWatchlist([]);
        setFriends([]);
        setProfile(GUEST_PROFILE);
        setCompleteProfileModalOpen(false);
        setAuthReady(true);
        return;
      }

      const user = session.user;
      syncedUserRef.current = user.id;
      setUserId(user.id);
      setUserEmail(user.email ?? null);
      setAuthProvider(user.app_metadata?.provider ?? null);
      setWatchlist([]);
      setAuthReady(true);

      const meta = user.user_metadata || {};
      const [dbProfile, incRequests, outgRequests, dbFriends, dbWatchlist] = await Promise.all([
        fetchUserProfile(user.id),
        fetchIncomingFriendRequests(user.id),
        fetchOutgoingFriendRequests(user.id),
        fetchLiveFriends(user.id),
        fetchLiveWatchlist(user.id),
      ]);

      let activeUsername = "";
      if (dbProfile && dbProfile.username && dbProfile.username !== "guest" && dbProfile.username !== "user") {
        activeUsername = dbProfile.username;
        setProfile({
          displayName: dbProfile.display_name,
          username: dbProfile.username,
          avatarId: dbProfile.avatar_character_id || DEFAULT_AVATAR_ID,
          age: dbProfile.age ? String(dbProfile.age) : "",
        });
      } else if (meta.username && meta.username !== "guest" && meta.username !== "user") {
        activeUsername = meta.username;
        const newProf = {
          displayName: meta.display_name || meta.full_name || meta.name || user.email?.split("@")[0] || "User",
          username: meta.username,
          avatarId: meta.avatar_id || DEFAULT_AVATAR_ID,
          age: meta.age ? String(meta.age) : "",
        };
        setProfile(newProf);
        await upsertUserProfile({
          id: user.id,
          username: newProf.username,
          display_name: newProf.displayName,
          avatar_character_id: newProf.avatarId,
          age: newProf.age,
        });
      } else {
        // No username yet (new email sign-up or first Google sign-in)
        setProfile({
          displayName: meta.full_name || meta.name || meta.display_name || user.email?.split("@")[0] || "User",
          username: user.email?.split("@")[0] || "user",
          avatarId: meta.avatar_id || DEFAULT_AVATAR_ID,
          age: "",
        });
        setCompleteProfileModalOpen(true);
      }

      setIncomingRequests(incRequests);
      setOutgoingRequests(outgRequests);
      setFriends(dbFriends.length > 0 ? dbFriends : IS_MOCK_MODE ? MOCK_FRIENDS : []);
      setWatchlist(dbWatchlist);
      setSyncedUserId(user.id);

      if (activeUsername) await acceptInvite(activeUsername);
    };

    // Realtime WebSocket subscription for live recommendations across circle
    const unsubRecs = subscribeToRecommendations(
      (newRec) => {
        setFriendRecommendations((prev) => {
          const exists = prev.some(
            (r) => r.id === newRec.id || (r.tmdb_id === newRec.tmdb_id && r.sender_name === newRec.sender_name)
          );
          if (exists) return prev;
          return [newRec, ...prev];
        });

        addToast({
          type: "rec",
          title: "New Circle Recommendation",
          message: `${newRec.sender_name} recommended "${newRec.title}".`,
          actionLabel: "View Film",
          onAction: () => {
            handleOpenMovieDetail(
              {
                id: newRec.tmdb_id,
                title: newRec.title,
                poster_path: newRec.poster_path,
                backdrop_path: newRec.backdrop_path || null,
                media_type: newRec.media_type,
                release_date: newRec.release_year,
                vote_average: 8.0,
                vote_count: 100,
                overview: newRec.note,
              },
              newRec
            );
          },
        });
      },
      (deletedId) => {
        setFriendRecommendations((prev) => prev.filter((r) => r.id !== deletedId));
      }
    );

    // onAuthStateChange fires INITIAL_SESSION on load, so it is the single source of auth state.
    // Supabase calls inside this callback can deadlock, hence the setTimeout.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return;
      if (event === "SIGNED_IN" && session?.user.id === syncedUserRef.current) return;
      setTimeout(() => syncUserSession(session), 0);
    });

    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      subscription.unsubscribe();
      unsubRecs();
    };
  }, []);

  // Realtime friend requests and accepts aimed at the signed-in user
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`friendships_${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friendships", filter: `friend_id=eq.${userId}` },
        async () => {
          const [inc, outg, updatedFriends] = await Promise.all([
            fetchIncomingFriendRequests(userId),
            fetchOutgoingFriendRequests(userId),
            fetchLiveFriends(userId),
          ]);
          setIncomingRequests(inc);
          setOutgoingRequests(outg);
          setFriends(updatedFriends.length > 0 ? updatedFriends : IS_MOCK_MODE ? MOCK_FRIENDS : []);
          addToast({
            type: "friend",
            title: "Circle Activity",
            message: "Your friends or friend requests changed.",
            actionLabel: "View Friends",
            onAction: () => handleTabChange("friends"),
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Resume the action a guest tried before signing in, once their data has loaded.
  const handlersRef = useRef<Parameters<PendingAction>[0] | null>(null);
  useEffect(() => {
    if (!syncedUserId || !pendingActionRef.current || !handlersRef.current) return;
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action(handlersRef.current);
  }, [syncedUserId]);

  const handleToggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    const themeName = nextMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", themeName);
    try {
      localStorage.setItem("cinecircle_theme", themeName);
    } catch (e) {}
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Watchlist Handlers with Live Supabase Persistence
  const handleToggleWatchlist = async (movie: MovieItem) => {
    if (!userId) {
      openAuth("SIGN_IN", (h) => {
        if (!h.watchlist.some((w) => w.tmdb_id === movie.id)) h.handleToggleWatchlist(movie);
      });
      return;
    }
    const exists = watchlist.find((w) => w.tmdb_id === movie.id);
    if (exists) {
      setWatchlist((prev) => prev.filter((w) => w.tmdb_id !== movie.id));
      await removeLiveWatchlistItem(exists.id);
    } else {
      const releaseYear = (movie.release_date || movie.first_air_date || "").substring(0, 4) || "2024";
      const tempId = `watch_${Date.now()}`;
      const newItem: WatchlistItem = {
        id: tempId,
        tmdb_id: movie.id,
        media_type: movie.media_type || "movie",
        title: movie.title || movie.name || "Untitled",
        poster_path: movie.poster_path,
        release_year: releaseYear,
        genre: "Movie",
        status: "WANT_TO_WATCH",
        added_at: new Date().toISOString(),
      };
      setWatchlist((prev) => [newItem, ...prev]);

      const saved = await addLiveWatchlistItem({
        userId,
        tmdbId: movie.id,
        mediaType: (movie.media_type as "movie" | "tv") || "movie",
        title: movie.title || movie.name || "Untitled",
        posterPath: movie.poster_path,
        releaseYear,
        genre: "Movie",
        status: "WANT_TO_WATCH",
      });

      if (saved) {
        setWatchlist((prev) => prev.map((w) => (w.id === tempId ? saved : w)));
      }
    }
  };

  const handleSetWatchStatus = async (movie: MovieItem, status: WatchStatus | "NONE", rating?: number) => {
    if (!userId) {
      openAuth("SIGN_IN", (h) => h.handleSetWatchStatus(movie, status, rating));
      return;
    }
    const exists = watchlist.find((w) => w.tmdb_id === movie.id);
    if (status === "NONE") {
      if (exists) {
        setWatchlist((prev) => prev.filter((w) => w.tmdb_id !== movie.id));
        await removeLiveWatchlistItem(exists.id);
      }
      return;
    }

    if (exists) {
      setWatchlist((prev) =>
        prev.map((w) =>
          w.tmdb_id === movie.id ? { ...w, status, rating_stars: rating !== undefined ? rating : w.rating_stars } : w
        )
      );
      await updateLiveWatchlistItem(exists.id, { status, rating_stars: rating });
    } else {
      const releaseYear = (movie.release_date || movie.first_air_date || "").substring(0, 4) || "2024";
      const tempId = `watch_${Date.now()}`;
      const newItem: WatchlistItem = {
        id: tempId,
        tmdb_id: movie.id,
        media_type: movie.media_type || "movie",
        title: movie.title || movie.name || "Untitled",
        poster_path: movie.poster_path,
        release_year: releaseYear,
        genre: "Movie",
        status: status,
        rating_stars: rating,
        added_at: new Date().toISOString(),
      };
      setWatchlist((prev) => [newItem, ...prev]);

      const saved = await addLiveWatchlistItem({
        userId,
        tmdbId: movie.id,
        mediaType: (movie.media_type as "movie" | "tv") || "movie",
        title: movie.title || movie.name || "Untitled",
        posterPath: movie.poster_path,
        releaseYear,
        genre: "Movie",
        status: status,
        ratingStars: rating,
      });

      if (saved) {
        setWatchlist((prev) => prev.map((w) => (w.id === tempId ? saved : w)));
      }
    }
  };

  handlersRef.current = { watchlist, handleToggleWatchlist, handleSetWatchStatus };

  const handleUpdateWatchlistStatus = async (id: string, status: WatchStatus, rating?: number) => {
    if (!userId) return openAuth();
    setWatchlist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status, rating_stars: rating || item.rating_stars } : item))
    );
    await updateLiveWatchlistItem(id, { status, rating_stars: rating });
  };

  const handleRemoveFromWatchlist = async (id: string) => {
    if (!userId) return openAuth();
    const removed = watchlist.find((w) => w.id === id);
    setWatchlist((prev) => prev.filter((w) => w.id !== id));
    await removeLiveWatchlistItem(id);
    if (!removed) return;
    addToast({
      type: "system",
      title: "Removed from Library",
      message: `"${removed.title}" was removed.`,
      actionLabel: "Undo",
      onAction: async () => {
        setWatchlist((prev) => [removed, ...prev]);
        const saved = await addLiveWatchlistItem({
          userId,
          tmdbId: removed.tmdb_id,
          mediaType: removed.media_type,
          title: removed.title,
          posterPath: removed.poster_path,
          releaseYear: removed.release_year,
          genre: removed.genre,
          status: removed.status,
          ratingStars: removed.rating_stars,
          recommendedBy: removed.recommended_by,
        });
        if (saved) setWatchlist((prev) => prev.map((w) => (w.id === removed.id ? saved : w)));
      },
    });
  };

  // Recommendation Submission Handler with Live Supabase Persistence
  const handlePublishRecommendation = async (data: {
    tmdbId: number;
    title: string;
    posterPath: string | null;
    backdropPath?: string | null;
    mediaType: "movie" | "tv";
    releaseYear?: string;
    ratingStars: number;
    note: string;
    tags: string[];
    recipient: string;
    guestName?: string;
  }) => {
    const senderName = data.guestName || profile.displayName;
    const senderAvatar = data.guestName ? "solaris" : profile.avatarId;
    const tempId = `rec_${Date.now()}`;
    const newRec: Recommendation = {
      id: tempId,
      sender_name: senderName,
      sender_avatar: senderAvatar,
      recipient: data.recipient,
      tmdb_id: data.tmdbId,
      media_type: data.mediaType,
      title: data.title,
      poster_path: data.posterPath,
      backdrop_path: data.backdropPath || null,
      release_year: data.releaseYear || "2024",
      genre: data.mediaType === "tv" ? "TV Series" : "Film",
      rating_stars: data.ratingStars,
      note: data.note,
      tags: data.tags,
      created_at: new Date().toISOString(),
    };
    setFriendRecommendations((prev) => [newRec, ...prev]);

    addToast({
      type: "rec",
      title: "Recommendation Shared",
      message: `"${data.title}" was shared with ${data.recipient === "Global" ? "the Global community" : data.recipient}.`,
    });

    const saved = await createLiveRecommendation({
      senderId: userId || undefined,
      senderName,
      senderAvatar,
      recipient: data.recipient,
      tmdbId: data.tmdbId,
      mediaType: data.mediaType,
      title: data.title,
      posterPath: data.posterPath,
      backdropPath: data.backdropPath || null,
      releaseYear: data.releaseYear || "2024",
      genre: data.mediaType === "tv" ? "TV Series" : "Film",
      ratingStars: data.ratingStars,
      note: data.note,
      tags: data.tags,
    });

    if (saved) {
      setFriendRecommendations((prev) => prev.map((r) => (r.id === tempId ? saved : r)));
    }
  };

  const handleDeleteRecommendation = async (id: string) => {
    setFriendRecommendations((prev) => prev.filter((r) => r.id !== id));
    await deleteLiveRecommendation(id);
  };

  // Friend Request & Circle Handlers
  const handleSendFriendRequest = async (targetUsername: string) => {
    if (!userId) {
      openAuth();
      return { success: false, error: "Sign in to send friend requests." };
    }
    const res = await sendFriendRequest(userId, targetUsername);
    if (res.success) {
      const outg = await fetchOutgoingFriendRequests(userId);
      setOutgoingRequests(outg);
    }
    return res;
  };

  const handleAcceptFriendRequest = async (requestId: string, requesterId: string) => {
    if (!userId) return;
    await acceptFriendRequest(requestId, requesterId, userId);
    const [inc, updatedFriends] = await Promise.all([fetchIncomingFriendRequests(userId), fetchLiveFriends(userId)]);
    setIncomingRequests(inc);
    if (updatedFriends.length > 0) {
      setFriends(updatedFriends);
    }
  };

  const handleDeclineFriendRequest = async (requestId: string) => {
    if (!userId) return;
    await declineFriendRequest(requestId);
    const inc = await fetchIncomingFriendRequests(userId);
    setIncomingRequests(inc);
  };

  const handleRemoveFriend = async (id: string) => {
    if (!userId) return;
    const removed = friends.find((f) => f.id === id);
    setFriends((prev) => prev.filter((f) => f.id !== id));
    await supabase
      .from("friendships")
      .delete()
      .or(`and(user_id.eq.${userId},friend_id.eq.${id}),and(user_id.eq.${id},friend_id.eq.${userId})`);
    if (!removed) return;
    addToast({
      type: "friend",
      title: "Friend Removed",
      message: `@${removed.username} was removed from your circle.`,
      actionLabel: "Undo",
      onAction: async () => {
        setFriends((prev) => [removed, ...prev]);
        await addLiveFriendship(userId, id);
      },
    });
  };

  const handleDeleteAccount = async (): Promise<string | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return "Your session has expired. Sign in again to delete your account.";
    const res = await fetch("/api/delete-account", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return body.error || "Unable to delete your account. Try again in a moment.";
    }
    await supabase.auth.signOut();
    addToast({ type: "system", title: "Account Deleted", message: "Your account and its data were permanently removed." });
    return null;
  };

  const gatedTab = GATED_TABS.find((t) => t === activeTab);

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col pb-24 transition-colors duration-300">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenAccountModal={() => setAccountModalOpen(true)}
        onOpenAuth={() => openAuth()}
        onLogout={handleLogout}
        onSelectMovie={(movie) => handleOpenMovieDetail(movie)}
        profile={profile}
        userEmail={userEmail}
        authReady={authReady}
        watchlistCount={watchlist.filter((w) => w.status === "WANT_TO_WATCH").length}
        friendsCount={friends.length}
        incomingRequestsCount={incomingRequests.length}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        onOpenInstallPwa={() => setInstallPwaModalOpen(true)}
      />

      {/* Invite banner for guests; signed-in users are connected automatically */}
      {invitedBy && authReady && !isSignedIn && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 w-full">
          <div className="p-4 bg-[var(--secondary-subtle)] border border-[var(--secondary-border)] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-[var(--secondary)] shadow-lg animate-in fade-in">
            <span className="font-bold">
              <strong>@{invitedBy}</strong> invited you to their circle. Create an account to join.
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openAuth("SIGN_UP")}
                className="h-11 px-4 rounded-xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-sm cursor-pointer"
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  inviteRef.current = null;
                  setInvitedBy(null);
                }}
                aria-label="Dismiss invitation"
                className="w-11 h-11 flex items-center justify-center hover:opacity-80 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-16 flex-1 w-full">
        {gatedTab && !isSignedIn ? (
          authReady && <SignInPrompt tab={gatedTab} onOpenAuth={openAuth} />
        ) : (
          <>
            {activeTab === "discover" && (
              <DiscoverView
                onOpenMovieDetail={handleOpenMovieDetail}
                onOpenTrailer={(title, youtubeKey) => setTrailerModal({ isOpen: true, title, youtubeKey })}
                onOpenRecommend={(movie) => setRecommendModal({ isOpen: true, movie })}
                onToggleWatchlist={handleToggleWatchlist}
                onDeleteRecommendation={isSignedIn ? handleDeleteRecommendation : undefined}
                onViewAllRecommendations={() => handleTabChange("recommendations")}
                watchlist={watchlist}
                friendRecommendations={friendRecommendations}
                friends={friends}
                currentUserDisplayName={profile.displayName}
                currentUsername={profile.username}
              />
            )}

            {activeTab === "recommendations" && (
              <RecommendationsView
                friendRecommendations={friendRecommendations}
                watchlist={watchlist}
                friends={friends}
                currentUserDisplayName={profile.displayName}
                currentUsername={profile.username}
                onOpenMovieDetail={handleOpenMovieDetail}
                onToggleWatchlist={handleToggleWatchlist}
                onDeleteRecommendation={isSignedIn ? handleDeleteRecommendation : undefined}
              />
            )}

            {activeTab === "watchlist" && (
              <WatchlistView
                watchlist={watchlist}
                friendRecommendations={friendRecommendations}
                currentUserDisplayName={profile.displayName}
                onUpdateStatus={handleUpdateWatchlistStatus}
                onRemove={handleRemoveFromWatchlist}
                onOpenRecommend={(movie) => setRecommendModal({ isOpen: true, movie })}
                onOpenMovieDetail={handleOpenMovieDetail}
                onOpenTrailer={(title, youtubeKey) => setTrailerModal({ isOpen: true, title, youtubeKey })}
              />
            )}

            {activeTab === "matcher" && (
              <GroupMatcherView
                friends={friends}
                watchlist={watchlist}
                onOpenTrailer={(title, youtubeKey) => setTrailerModal({ isOpen: true, title, youtubeKey })}
                onOpenMovieDetail={handleOpenMovieDetail}
                onOpenRecommend={(movie) => setRecommendModal({ isOpen: true, movie })}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}

            {activeTab === "friends" && (
              <FriendsView
                friends={friends}
                watchlist={watchlist}
                friendRecommendations={friendRecommendations}
                currentUserDisplayName={profile.displayName}
                incomingRequests={incomingRequests}
                outgoingRequests={outgoingRequests}
                onSendFriendRequest={handleSendFriendRequest}
                onAcceptFriendRequest={handleAcceptFriendRequest}
                onDeclineFriendRequest={handleDeclineFriendRequest}
                onRemoveFriend={handleRemoveFriend}
                onOpenInvite={() => setInviteModalOpen(true)}
                onOpenRecommend={() => setRecommendModal({ isOpen: true, movie: null })}
                onOpenFriendLibrary={(friend) => setSelectedFriendForLibrary(friend)}
              />
            )}
          </>
        )}
      </main>

      {/* Global Interactive Modals */}
      <MovieDetailModal
        isOpen={detailModal.isOpen}
        onClose={handleCloseMovieDetail}
        movieId={detailModal.movieId}
        mediaType={detailModal.mediaType}
        initialMovie={detailModal.initialMovie}
        recommendationNote={detailModal.recommendationNote}
        recommendedBy={detailModal.recommendedBy}
        ratingStars={detailModal.ratingStars}
        currentUserDisplayName={profile.displayName}
        onOpenTrailer={(title, youtubeKey) => setTrailerModal({ isOpen: true, title, youtubeKey })}
        onOpenRecommend={(movie) => setRecommendModal({ isOpen: true, movie })}
        onToggleWatchlist={handleToggleWatchlist}
        onSetWatchStatus={handleSetWatchStatus}
        watchlist={watchlist}
      />

      <AuthModal
        isOpen={authModal.open}
        initialMode={authModal.mode}
        onClose={() => setAuthModal((prev) => ({ ...prev, open: false }))}
      />

      <CompleteProfileModal
        isOpen={completeProfileModalOpen}
        userId={userId || ""}
        initialDisplayName={profile.displayName !== "Guest" ? profile.displayName : ""}
        initialEmail={userEmail || ""}
        onSignOut={handleLogout}
        onComplete={async (completed) => {
          const newProf = {
            displayName: completed.displayName,
            username: completed.username,
            avatarId: completed.avatarId,
            age: completed.age,
          };
          setProfile(newProf);
          if (userId) {
            await upsertUserProfile({
              id: userId,
              username: newProf.username,
              display_name: newProf.displayName,
              avatar_character_id: newProf.avatarId,
              age: newProf.age,
            });
          }
          setCompleteProfileModalOpen(false);
          await acceptInvite(newProf.username);
        }}
      />

      <TrailerModal
        isOpen={trailerModal.isOpen}
        onClose={() => setTrailerModal({ isOpen: false, title: "", youtubeKey: null })}
        title={trailerModal.title}
        youtubeKey={trailerModal.youtubeKey}
      />

      <RecommendModal
        isOpen={recommendModal.isOpen}
        onClose={() => setRecommendModal({ isOpen: false, movie: null })}
        movie={recommendModal.movie}
        friends={friends}
        currentUserDisplayName={profile.displayName}
        isGuest={!isSignedIn}
        onRecommend={handlePublishRecommendation}
      />

      <FriendLibraryModal
        isOpen={selectedFriendForLibrary !== null}
        onClose={() => setSelectedFriendForLibrary(null)}
        friend={selectedFriendForLibrary}
        myWatchlist={watchlist}
        onToggleMyWatchlist={handleToggleWatchlist}
        onOpenMovieDetail={handleOpenMovieDetail}
      />

      {accountModalOpen && (
        <AccountModal
          isOpen
          onClose={() => setAccountModalOpen(false)}
          userEmail={userEmail}
          currentUserId={userId || undefined}
          authProvider={authProvider}
          currentAvatarId={profile.avatarId}
          currentDisplayName={profile.displayName}
          currentUsername={profile.username}
          currentAge={profile.age}
          onSaveProfile={async (updated) => {
            const newProf = {
              displayName: updated.displayName,
              username: updated.username,
              avatarId: updated.avatarId,
              age: updated.age ?? profile.age,
            };
            const saved = userId
              ? await upsertUserProfile({
                  id: userId,
                  username: newProf.username,
                  display_name: newProf.displayName,
                  avatar_character_id: newProf.avatarId,
                  age: newProf.age,
                })
              : false;
            if (!saved) return "Unable to save your profile. Check your connection and try again.";
            setProfile(newProf);
            addToast({ type: "system", title: "Profile Saved", message: "Your profile details were updated." });
            return null;
          }}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      <CookieConsentModal />

      <InstallPwaModal isOpen={installPwaModalOpen} onClose={() => setInstallPwaModalOpen(false)} />

      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        currentUsername={profile.username}
        currentDisplayName={profile.displayName}
      />

      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        watchlistCount={watchlist.filter((w) => w.status === "WANT_TO_WATCH").length}
        friendsCount={friends.length}
        incomingRequestsCount={incomingRequests.length}
      />

      <ToastNotification toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <footer className="border-t border-[var(--surface-border)] mt-24 py-12 text-center text-xs text-[var(--text-secondary)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium">CineCircle • Private Friend Film Feed & Discovery Platform</p>
          <div className="flex items-center gap-4 text-xs font-bold text-[var(--text-muted)]">
            <span>Powered by TMDB</span>
            <span>•</span>
            <span>Supabase Auth</span>
            <span>•</span>
            <span>Fragments UI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
