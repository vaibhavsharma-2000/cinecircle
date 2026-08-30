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
import { CookieConsentModal } from "@/components/CookieConsentModal";
import { MovieItem } from "@/lib/tmdb";
import { Recommendation, WatchlistItem, FriendItem, supabase } from "@/lib/supabase";

import {
  MOCK_RECOMMENDATIONS,
  MOCK_WATCHLIST,
  MOCK_FRIENDS,
  MOCK_DEMO_PROFILE,
  MOCK_DEMO_EMAIL,
} from "@/lib/mockData";

// Environment check: Staging / Dev uses mock data; Production starts completely clean
const IS_MOCK_MODE = process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === "true";
const STORAGE_PREFIX = IS_MOCK_MODE ? "cinecircle_stage_" : "cinecircle_prod_";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("discover");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
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
          avatarId: "tony_stark",
          age: "24",
        }
  );

  // Modal States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);

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

  // Supabase Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        const meta = session.user.user_metadata || {};
        if (meta.display_name) {
          setProfile({
            displayName: meta.display_name,
            username: meta.username || session.user.email.split("@")[0],
            avatarId: meta.avatar_id || "tony_stark",
            age: meta.age || "24",
          });
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      } else {
        // Keep cached email if present
      }
    });

    return () => subscription.unsubscribe();
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
    setUserEmail(null);
  };

  // Movie Details Click Handler
  const handleOpenMovieDetail = (
    movie: MovieItem,
    recommendation?: Recommendation
  ) => {
    setDetailModal({
      isOpen: true,
      movieId: movie.id,
      mediaType: movie.media_type || "movie",
      initialMovie: movie,
      recommendationNote: recommendation?.note,
      recommendedBy: recommendation?.sender_name,
      ratingStars: recommendation?.rating_stars,
    });
  };

  // Watchlist Handlers
  const handleToggleWatchlist = (movie: MovieItem) => {
    const exists = watchlist.find((w) => w.tmdb_id === movie.id);
    if (exists) {
      setWatchlist(watchlist.filter((w) => w.tmdb_id !== movie.id));
    } else {
      const newItem: WatchlistItem = {
        id: `watch_${Date.now()}`,
        tmdb_id: movie.id,
        media_type: movie.media_type || "movie",
        title: movie.title || movie.name || "Untitled",
        poster_path: movie.poster_path,
        release_year: (movie.release_date || movie.first_air_date || "").substring(0, 4),
        genre: "Movie",
        status: "WANT_TO_WATCH",
        added_at: new Date().toISOString(),
      };
      setWatchlist([newItem, ...watchlist]);
    }
  };

  const handleUpdateWatchlistStatus = (
    id: string,
    status: "WANT_TO_WATCH" | "WATCHED",
    rating?: number
  ) => {
    setWatchlist(
      watchlist.map((item) =>
        item.id === id ? { ...item, status, rating_stars: rating || item.rating_stars } : item
      )
    );
  };

  const handleRemoveFromWatchlist = (id: string) => {
    setWatchlist(watchlist.filter((w) => w.id !== id));
  };

  // Recommendation Submission Handler
  const handlePublishRecommendation = (data: {
    tmdbId: number;
    title: string;
    posterPath: string | null;
    ratingStars: number;
    note: string;
    tags: string[];
    recipient: string;
  }) => {
    const newRec: Recommendation = {
      id: `rec_${Date.now()}`,
      sender_name: profile.displayName,
      sender_avatar: profile.avatarId,
      recipient: data.recipient,
      tmdb_id: data.tmdbId,
      media_type: "movie",
      title: data.title,
      poster_path: data.posterPath,
      release_year: "2024",
      genre: "Film",
      rating_stars: data.ratingStars,
      note: data.note,
      tags: data.tags,
      created_at: new Date().toISOString(),
    };
    setFriendRecommendations([newRec, ...friendRecommendations]);
  };

  // Friends Handlers
  const handleAddFriend = (username: string) => {
    const newFriend: FriendItem = {
      id: `friend_${Date.now()}`,
      username: username.replace(/^@/, ""),
      display_name: username.replace(/^@/, "").replace(/^[a-z]/, (c) => c.toUpperCase()),
      avatar_character_id: "barbie",
      status: "ACCEPTED",
      stats: { recommendedCount: 0, watchedCount: 0, topGenre: "Drama" },
    };
    setFriends([...friends, newFriend]);
  };

  const handleRemoveFriend = (id: string) => {
    setFriends(friends.filter((f) => f.id !== id));
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
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

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
            onDeleteRecommendation={(id) =>
              setFriendRecommendations(friendRecommendations.filter((r) => r.id !== id))
            }
            onViewAllRecommendations={() => setActiveTab("recommendations")}
            watchlist={watchlist}
            friendRecommendations={friendRecommendations}
          />
        )}

        {activeTab === "recommendations" && (
          <RecommendationsView
            friendRecommendations={friendRecommendations}
            watchlist={watchlist}
            onOpenMovieDetail={handleOpenMovieDetail}
            onToggleWatchlist={handleToggleWatchlist}
            onDeleteRecommendation={(id) =>
              setFriendRecommendations(friendRecommendations.filter((r) => r.id !== id))
            }
          />
        )}

        {activeTab === "watchlist" && (
          <WatchlistView
            watchlist={watchlist}
            friendRecommendations={friendRecommendations}
            currentUserDisplayName={profile.displayName}
            onUpdateStatus={handleUpdateWatchlistStatus}
            onRemove={handleRemoveFromWatchlist}
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
          />
        )}

        {activeTab === "friends" && (
          <FriendsView
            friends={friends}
            onAddFriend={handleAddFriend}
            onRemoveFriend={handleRemoveFriend}
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
        onRecommend={handlePublishRecommendation}
      />

      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        userEmail={userEmail}
        currentAvatarId={profile.avatarId}
        currentDisplayName={profile.displayName}
        currentUsername={profile.username}
        currentAge={profile.age}
        onSaveProfile={(updated) =>
          setProfile({
            ...profile,
            displayName: updated.displayName,
            username: updated.username,
            avatarId: updated.avatarId,
            age: updated.age || profile.age,
          })
        }
        onDeleteAccount={async () => {
          await supabase.auth.signOut();
          localStorage.removeItem(`${STORAGE_PREFIX}user_email`);
          localStorage.removeItem(`${STORAGE_PREFIX}user_profile`);
          localStorage.removeItem(`${STORAGE_PREFIX}watchlist`);
          setUserEmail(null);
          setProfile({
            displayName: "Guest",
            username: "guest",
            avatarId: "tony_stark",
            age: "24",
          });
        }}
      />

      {/* Global Cookie Preferences & Consent Banner */}
      <CookieConsentModal />

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
