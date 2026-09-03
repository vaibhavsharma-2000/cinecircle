"use client";

import { useState, useEffect } from "react";
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
import { AuthModal } from "@/components/AuthModal";
import { CompleteProfileModal } from "@/components/CompleteProfileModal";
import { CookieConsentModal } from "@/components/CookieConsentModal";
import { InstallPwaModal } from "@/components/InstallPwaModal";
import { InviteModal } from "@/components/InviteModal";
import { FriendLibraryModal } from "@/components/FriendLibraryModal";
import { MovieItem } from "@/lib/tmdb";
import { Recommendation, WatchlistItem, FriendItem, supabase } from "@/lib/supabase";
import { DEFAULT_AVATAR_ID } from "@/constants/avatars";

import {
  MOCK_RECOMMENDATIONS,
  MOCK_WATCHLIST,
  MOCK_FRIENDS,
  MOCK_DEMO_PROFILE,
  MOCK_DEMO_EMAIL,
} from "@/lib/mockData";

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
const STORAGE_PREFIX = IS_MOCK_MODE ? "cinecircle_stage_" : "cinecircle_prod_";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("discover");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(IS_MOCK_MODE ? MOCK_DEMO_EMAIL : null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(IS_MOCK_MODE ? MOCK_WATCHLIST : []);
  const [friendRecommendations, setFriendRecommendations] = useState<Recommendation[]>(
    IS_MOCK_MODE ? MOCK_RECOMMENDATIONS : []
  );
  const [friends, setFriends] = useState<FriendItem[]>(IS_MOCK_MODE ? MOCK_FRIENDS : []);
  const [profile, setProfile] = useState(
    IS_MOCK_MODE
      ? MOCK_DEMO_PROFILE
      : {
          displayName: "Guest",
          username: "guest",
          avatarId: DEFAULT_AVATAR_ID,
          age: "24",
        }
  );

  // Modal States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [completeProfileModalOpen, setCompleteProfileModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [installPwaModalOpen, setInstallPwaModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [invitedBy, setInvitedBy] = useState<string | null>(null);

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

  // LocalStorage state persistence across browser tab closes
  useEffect(() => {
    const cachedProfile = localStorage.getItem(`${STORAGE_PREFIX}user_profile`);
    if (cachedProfile) {
      try {
        setProfile(JSON.parse(cachedProfile));
      } catch (e) {}
    }
    const cachedEmail = localStorage.getItem(`${STORAGE_PREFIX}user_email`);
    if (cachedEmail) {
      setUserEmail(cachedEmail);
    }
    const cachedWatchlist = localStorage.getItem(`${STORAGE_PREFIX}watchlist`);
    if (cachedWatchlist) {
      try {
        setWatchlist(JSON.parse(cachedWatchlist));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(`${STORAGE_PREFIX}user_email`, userEmail);
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}user_email`);
    }
    localStorage.setItem(`${STORAGE_PREFIX}user_profile`, JSON.stringify(profile));
  }, [userEmail, profile]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}watchlist`, JSON.stringify(watchlist));
  }, [watchlist]);

  // Live Supabase Auth, Invite Handling, & Multi-User Data Synchronization
  useEffect(() => {
    // Check for incoming friend invite query param (?invite=username)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const inviteUser = urlParams.get("invite");
      if (inviteUser && inviteUser.trim() !== "") {
        const cleanInviter = inviteUser.trim().replace(/^@/, "");
        setInvitedBy(cleanInviter);
        setFriends((prev) => {
          const exists = prev.some((f) => f.username.toLowerCase() === cleanInviter.toLowerCase());
          if (exists) return prev;
          return [
            {
              id: `friend_invite_${Date.now()}`,
              username: cleanInviter,
              display_name: cleanInviter.charAt(0).toUpperCase() + cleanInviter.slice(1),
              avatar_character_id: "barbie",
              status: "ACCEPTED",
              stats: { recommendedCount: 1, watchedCount: 8, topGenre: "Drama" },
            },
            ...prev,
          ];
        });
      }
    }

    const syncUserSession = async (session: any) => {
      if (!session?.user) {
        setUserId(null);
        if (!IS_MOCK_MODE) {
          setUserEmail(null);
          setWatchlist([]);
        }
        return;
      }

      setUserId(session.user.id);
      setUserEmail(session.user.email ?? null);

      const dbProfile = await fetchUserProfile(session.user.id);
      const meta = session.user.user_metadata || {};

      let activeUsername = "";
      if (dbProfile && dbProfile.username && dbProfile.username !== "guest" && dbProfile.username !== "user") {
        activeUsername = dbProfile.username;
        setProfile({
          displayName: dbProfile.display_name,
          username: dbProfile.username,
          avatarId: dbProfile.avatar_character_id || DEFAULT_AVATAR_ID,
          age: dbProfile.age ? String(dbProfile.age) : "24",
        });
      } else if (meta.username && meta.username !== "guest" && meta.username !== "user") {
        activeUsername = meta.username;
        const newProf = {
          displayName: meta.display_name || meta.full_name || meta.name || session.user.email?.split("@")[0] || "User",
          username: meta.username,
          avatarId: meta.avatar_id || DEFAULT_AVATAR_ID,
          age: String(meta.age || "24"),
        };
        setProfile(newProf);
        await upsertUserProfile({
          id: session.user.id,
          username: newProf.username,
          display_name: newProf.displayName,
          avatar_character_id: newProf.avatarId,
          age: newProf.age,
        });
      } else {
        // Missing profile or username handle (e.g. Google Auth!)
        const gName = meta.full_name || meta.name || meta.display_name || session.user.email?.split("@")[0] || "User";
        setProfile({
          displayName: gName,
          username: session.user.email?.split("@")[0] || "user",
          avatarId: meta.avatar_id || DEFAULT_AVATAR_ID,
          age: "24",
        });
        setCompleteProfileModalOpen(true);
      }

      // Mutual Reciprocal Friend Syncing for Invite Links
      if (invitedBy && activeUsername && invitedBy.toLowerCase() !== activeUsername.toLowerCase()) {
        await addLiveFriendship(activeUsername, invitedBy);
      }

      // Fetch pending incoming & outgoing friend requests
      const [incRequests, outgRequests] = await Promise.all([
        fetchIncomingFriendRequests(session.user.id),
        fetchOutgoingFriendRequests(session.user.id),
      ]);
      setIncomingRequests(incRequests);
      setOutgoingRequests(outgRequests);

      // Fetch live friends from Supabase for current user
      const dbFriends = await fetchLiveFriends(session.user.id);
      if (dbFriends.length > 0) {
        setFriends(dbFriends);
      }

      const dbWatchlist = await fetchLiveWatchlist(session.user.id);
      if (dbWatchlist.length > 0) {
        setWatchlist(dbWatchlist);
      }
    };

    // 1. Initial session check and data fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUserSession(session);
    });

    // 2. Load live recommendations for all users
    fetchLiveRecommendations().then((dbRecs) => {
      if (dbRecs.length > 0) {
        setFriendRecommendations(dbRecs);
      }
    });

    // 3. Realtime WebSocket subscription for live recommendations across circle
    const unsubRecs = subscribeToRecommendations(
      (newRec) => {
        setFriendRecommendations((prev) => {
          const exists = prev.some(
            (r) =>
              r.id === newRec.id ||
              (r.tmdb_id === newRec.tmdb_id && r.sender_name === newRec.sender_name)
          );
          if (exists) return prev;
          return [newRec, ...prev];
        });
      },
      (deletedId) => {
        setFriendRecommendations((prev) => prev.filter((r) => r.id !== deletedId));
      }
    );

    // 4. Realtime subscription for friendship changes and incoming requests
    const friendshipsChannel = supabase
      .channel("live_friendships_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friendships" },
        async () => {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user?.id) {
            const [inc, outg, updatedFriends] = await Promise.all([
              fetchIncomingFriendRequests(session.user.id),
              fetchOutgoingFriendRequests(session.user.id),
              fetchLiveFriends(session.user.id),
            ]);
            setIncomingRequests(inc);
            setOutgoingRequests(outg);
            if (updatedFriends.length > 0) {
              setFriends(updatedFriends);
            }
          }
        }
      )
      .subscribe();

    // 5. Auth State change subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUserSession(session);
    });

    return () => {
      subscription.unsubscribe();
      unsubRecs();
      friendshipsChannel.unsubscribe();
    };
  }, []);

  const handleToggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setUserEmail(null);
    setIncomingRequests([]);
    setOutgoingRequests([]);
    if (!IS_MOCK_MODE) {
      setWatchlist([]);
      setFriends([]);
      setProfile({
        displayName: "Guest",
        username: "guest",
        avatarId: "tony_stark",
        age: "24",
      });
    }
  };

  // Movie Details Click Handler - dynamically preserves movie vs tv series
  const handleOpenMovieDetail = (
    movie: MovieItem,
    recommendation?: Recommendation
  ) => {
    const resolvedMediaType: "movie" | "tv" =
      recommendation?.media_type ||
      movie.media_type ||
      (movie.first_air_date ? "tv" : "movie");

    setDetailModal({
      isOpen: true,
      movieId: movie.id,
      mediaType: resolvedMediaType,
      initialMovie: {
        ...movie,
        media_type: resolvedMediaType,
      },
      recommendationNote: recommendation?.note,
      recommendedBy: recommendation?.sender_name,
      ratingStars: recommendation?.rating_stars,
    });
  };

  // Watchlist Handlers with Live Supabase Persistence
  const handleToggleWatchlist = async (movie: MovieItem) => {
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
        userId: userId || undefined,
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

  const handleSetWatchStatus = async (
    movie: MovieItem,
    status: "WANT_TO_WATCH" | "CURRENTLY_WATCHING" | "WATCHED" | "NONE",
    rating?: number
  ) => {
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
        userId: userId || undefined,
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

  const handleUpdateWatchlistStatus = async (
    id: string,
    status: "WANT_TO_WATCH" | "CURRENTLY_WATCHING" | "WATCHED",
    rating?: number
  ) => {
    setWatchlist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, rating_stars: rating || item.rating_stars } : item
      )
    );
    await updateLiveWatchlistItem(id, { status, rating_stars: rating });
  };

  const handleRemoveFromWatchlist = async (id: string) => {
    setWatchlist((prev) => prev.filter((w) => w.id !== id));
    await removeLiveWatchlistItem(id);
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
    const senderAvatar = data.guestName ? "goku" : profile.avatarId;
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
      setFriendRecommendations((prev) =>
        prev.map((r) => (r.id === tempId ? saved : r))
      );
    }
  };

  const handleDeleteRecommendation = async (id: string) => {
    setFriendRecommendations((prev) => prev.filter((r) => r.id !== id));
    await deleteLiveRecommendation(id);
  };

  // Friend Request & Circle Handlers
  const handleSendFriendRequest = async (targetUsername: string) => {
    if (!userId) {
      setAuthModalOpen(true);
      return { success: false, error: "Please sign in to send friend requests" };
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
    const [inc, updatedFriends] = await Promise.all([
      fetchIncomingFriendRequests(userId),
      fetchLiveFriends(userId),
    ]);
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
    setFriends((prev) => prev.filter((f) => f.id !== id));
    if (userId) {
      await supabase
        .from("friendships")
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${id}),and(user_id.eq.${id},friend_id.eq.${userId})`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col pb-24 transition-colors duration-300">
      {/* Navbar with Supabase Auth */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAccountModal={() => setAccountModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onSelectMovie={(movie) => handleOpenMovieDetail(movie)}
        profile={profile}
        userEmail={userEmail}
        watchlistCount={watchlist.filter((w) => w.status === "WANT_TO_WATCH").length}
        friendsCount={friends.length}
        incomingRequestsCount={incomingRequests.length}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        onOpenInstallPwa={() => setInstallPwaModalOpen(true)}
      />

      {/* Incoming Invite Welcome Banner */}
      {invitedBy && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-xs text-emerald-300 shadow-lg animate-in fade-in">
            <span className="font-extrabold flex items-center gap-2">
              🎉 Welcome to CineCircle! You&apos;ve joined <strong className="underline decoration-emerald-400">@{invitedBy}</strong>&apos;s private movie circle!
            </span>
            <button
              type="button"
              onClick={() => setInvitedBy(null)}
              className="text-emerald-400 hover:text-white font-bold ml-4 text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Tab View Container with Generous Spacing */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-16 flex-1 w-full">
        {activeTab === "discover" && (
          <DiscoverView
            onOpenMovieDetail={handleOpenMovieDetail}
            onOpenTrailer={(title, youtubeKey) =>
              setTrailerModal({ isOpen: true, title, youtubeKey })
            }
            onOpenRecommend={(movie) => setRecommendModal({ isOpen: true, movie })}
            onToggleWatchlist={handleToggleWatchlist}
            onDeleteRecommendation={handleDeleteRecommendation}
            onViewAllRecommendations={() => setActiveTab("recommendations")}
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
            onDeleteRecommendation={handleDeleteRecommendation}
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
            onOpenTrailer={(title, youtubeKey) =>
              setTrailerModal({ isOpen: true, title, youtubeKey })
            }
          />
        )}

        {activeTab === "matcher" && (
          <GroupMatcherView
            friends={friends}
            watchlist={watchlist}
            onOpenTrailer={(title, youtubeKey) =>
              setTrailerModal({ isOpen: true, title, youtubeKey })
            }
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
      </main>

      {/* Global Interactive Modals */}
      <MovieDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, movieId: null })}
        movieId={detailModal.movieId}
        mediaType={detailModal.mediaType}
        initialMovie={detailModal.initialMovie}
        recommendationNote={detailModal.recommendationNote}
        recommendedBy={detailModal.recommendedBy}
        ratingStars={detailModal.ratingStars}
        currentUserDisplayName={profile.displayName}
        onOpenTrailer={(title, youtubeKey) =>
          setTrailerModal({ isOpen: true, title, youtubeKey })
        }
        onOpenRecommend={(movie) => setRecommendModal({ isOpen: true, movie })}
        onToggleWatchlist={handleToggleWatchlist}
        onSetWatchStatus={handleSetWatchStatus}
        watchlist={watchlist}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(userData) => {
          setUserEmail(userData.email);
          setProfile({
            displayName: userData.displayName,
            username: userData.username,
            avatarId: userData.avatarId,
            age: userData.age || "24",
          });
        }}
      />

      <CompleteProfileModal
        isOpen={completeProfileModalOpen}
        userId={userId || ""}
        initialDisplayName={profile.displayName !== "Guest" ? profile.displayName : ""}
        initialEmail={userEmail || ""}
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
        isGuest={!userId || profile.displayName === "Guest"}
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

      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        userEmail={userEmail}
        currentUserId={userId || undefined}
        currentAvatarId={profile.avatarId}
        currentDisplayName={profile.displayName}
        currentUsername={profile.username}
        currentAge={profile.age}
        onSaveProfile={async (updated) => {
          const newProf = {
            displayName: updated.displayName,
            username: updated.username,
            avatarId: updated.avatarId,
            age: updated.age || profile.age,
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
        }}
        onDeleteAccount={async () => {
          await supabase.auth.signOut();
          localStorage.removeItem(`${STORAGE_PREFIX}user_email`);
          localStorage.removeItem(`${STORAGE_PREFIX}user_profile`);
          localStorage.removeItem(`${STORAGE_PREFIX}watchlist`);
          setUserEmail(null);
          setProfile({
            displayName: "Guest",
            username: "guest",
            avatarId: DEFAULT_AVATAR_ID,
            age: "24",
          });
        }}
      />

      {/* Global Cookie Preferences & Consent Banner */}
      <CookieConsentModal />

      {/* PWA Mobile Installation Guidance Modal */}
      <InstallPwaModal
        isOpen={installPwaModalOpen}
        onClose={() => setInstallPwaModalOpen(false)}
      />

      {/* 1-Click Friend Invite Modal */}
      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        currentUsername={profile.username}
        currentDisplayName={profile.displayName}
      />

      {/* Footer */}
      <footer className="border-t border-[var(--surface-border)] mt-24 py-12 text-center text-xs text-[var(--text-secondary)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium">CineCircle • Private Friend Film Feed & Discovery Platform</p>
          <div className="flex items-center gap-4 text-[11px] font-bold text-[var(--text-muted)]">
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
