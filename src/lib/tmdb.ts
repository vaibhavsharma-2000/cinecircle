export interface MovieItem {
  id: number;
  title: string;
  original_title?: string;
  name?: string; // For TV shows
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  runtime?: number;
  tagline?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  media_type?: "movie" | "tv";
  trailer_key?: string;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProvidersResult {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

if (!TMDB_API_KEY && typeof window !== "undefined") {
  console.warn("⚠️ CineCircle: NEXT_PUBLIC_TMDB_API_KEY is not set. TMDB discovery and search features will fail.");
}

/**
 * Unified TMDB Request Engine:
 * When executed in the browser, requests are routed through the internal proxy (/api/tmdb)
 * to bypass ad-blockers, client ISP/DNS blocking, and CORS errors.
 * On server-side / static build, requests directly query TMDB.
 */
async function fetchTMDB(
  endpoint: string,
  params: Record<string, string | number | undefined> | URLSearchParams = {}
): Promise<any> {
  const searchParams = new URLSearchParams();

  if (params instanceof URLSearchParams) {
    params.forEach((val, key) => searchParams.append(key, val));
  } else {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        searchParams.append(key, String(val));
      }
    });
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (typeof window !== "undefined") {
    searchParams.set("endpoint", cleanEndpoint);
    const res = await fetch(`/api/tmdb?${searchParams.toString()}`);
    if (!res.ok) throw new Error(`TMDB Proxy error: ${res.status}`);
    return await res.json();
  }

  // Server-side
  if (!searchParams.has("api_key")) {
    searchParams.append("api_key", TMDB_API_KEY);
  }
  const res = await fetch(`${TMDB_BASE_URL}${cleanEndpoint}?${searchParams.toString()}`);
  if (!res.ok) throw new Error(`TMDB direct fetch error: ${res.status}`);
  return await res.json();
}

export interface GenreCategory {
  id: string;
  label: string;
  params: string;
}

export const DISCOVERY_CATEGORIES: GenreCategory[] = [
  {
    id: "critics",
    label: "Top Rated & Masterpieces",
    params: "sort_by=vote_average.desc&vote_count.gte=2000&vote_average.gte=8.0",
  },
  {
    id: "latest",
    label: "Trending Now",
    params: "sort_by=popularity.desc&primary_release_date.gte=2023-06-01&vote_count.gte=300",
  },
  {
    id: "romance",
    label: "Rom-Coms & Feel-Good",
    params: "with_genres=10749,35&sort_by=popularity.desc&vote_count.gte=500",
  },
  {
    id: "thriller",
    label: "High-Stakes Thrillers",
    params: "with_genres=53,9648&sort_by=popularity.desc&vote_count.gte=500",
  },
  {
    id: "mindbender",
    label: "Mind-Bending Sci-Fi",
    params: "with_genres=878,9648&sort_by=vote_average.desc&vote_count.gte=1000",
  },
  {
    id: "comedy",
    label: "Crowd Comedies",
    params: "with_genres=35&sort_by=popularity.desc&vote_count.gte=500",
  },
  {
    id: "drama",
    label: "Award Winners & Dramas",
    params: "with_genres=18&sort_by=vote_average.desc&vote_count.gte=2000",
  },
];

export const MOCK_MOVIES: MovieItem[] = [
  {
    id: 693134,
    title: "Dune: Part Two",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
    poster_path: "/1pdfLPoLStWDYRGlA2L85t0Gj22.jpg",
    backdrop_path: "/xOMo8WhK21rmA2sXCVgV2D29DZa.jpg",
    release_date: "2024-02-27",
    vote_average: 8.5,
    vote_count: 5120,
    media_type: "movie",
    trailer_key: "Way9Dexny3w",
  },
  {
    id: 95396,
    title: "Severance",
    overview: "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.",
    poster_path: "/2c4iJvEknv2V2l7yXl1bB45wA3y.jpg",
    backdrop_path: "/xOMo8WhK21rmA2sXCVgV2D29DZa.jpg",
    release_date: "2022-02-18",
    vote_average: 8.7,
    vote_count: 2400,
    media_type: "tv",
    trailer_key: "xEQP4VVuyrY",
  },
  {
    id: 666243,
    title: "Palm Springs",
    overview: "When carefree Nyles and reluctant maid of honor Sarah have a chance encounter at a Palm Springs wedding, things get complicated.",
    poster_path: "/aIm3Kw783zLfyvMv2vW1V9l0S.jpg",
    backdrop_path: "/aIm3Kw783zLfyvMv2vW1V9l0S.jpg",
    release_date: "2020-07-10",
    vote_average: 7.4,
    vote_count: 2800,
    media_type: "movie",
    trailer_key: "CpBLQKaiEfQ",
  },
  {
    id: 872585,
    title: "Oppenheimer",
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop_path: "/rLb2cwFXYJYazFPQjjhlUtAn6in.jpg",
    release_date: "2023-07-19",
    vote_average: 8.9,
    vote_count: 8900,
    media_type: "movie",
    trailer_key: "uYPbbksJxIg",
  },
];

export async function searchMovies(query: string): Promise<MovieItem[]> {
  if (!query.trim()) return [];

  try {
    const data = await fetchTMDB("/search/multi", {
      query,
      include_adult: "false",
      language: "en-US",
      page: "1",
    });
    return (data.results || []).filter(
      (item: MovieItem) => item.poster_path && (item.title || item.name)
    );
  } catch (error: any) {
    console.warn("Notice: TMDB search fallback:", error?.message || error);
    return MOCK_MOVIES.filter((m) =>
      m.title.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export async function getTrendingMovies(): Promise<MovieItem[]> {
  try {
    const data = await fetchTMDB("/trending/all/week", { language: "en-US" });
    return (data.results || []).filter(
      (item: MovieItem) => item.poster_path && (item.title || item.name)
    );
  } catch (error: any) {
    console.warn("Notice: TMDB trending fallback:", error?.message || error);
    return MOCK_MOVIES;
  }
}

export async function getMoviesByCategory(
  categoryId: string,
  page: number = 1
): Promise<MovieItem[]> {
  const category = DISCOVERY_CATEGORIES.find((c) => c.id === categoryId) || DISCOVERY_CATEGORIES[0];

  try {
    const params = new URLSearchParams(category.params);
    params.set("include_adult", "false");
    params.set("language", "en-US");
    params.set("page", String(page));

    const data = await fetchTMDB("/discover/movie", params);
    return (data.results || []).filter((item: MovieItem) => item.poster_path);
  } catch (error: any) {
    console.warn("Notice: TMDB category discovery fallback:", error?.message || error);
    return MOCK_MOVIES;
  }
}

export async function getMovieTrailerKey(id: number, mediaType: "movie" | "tv" = "movie"): Promise<string | null> {
  try {
    const data = await fetchTMDB(`/${mediaType}/${id}/videos`, { language: "en-US" });
    const videos = data.results || [];
    
    const trailer =
      videos.find((v: { site: string; type: string; key: string }) => v.site === "YouTube" && v.type === "Trailer") ||
      videos.find((v: { site: string; type: string; key: string }) => v.site === "YouTube" && v.type === "Teaser") ||
      videos[0];

    return trailer ? trailer.key : null;
  } catch (error: any) {
    console.warn("Notice: Trailer fetch fallback:", error?.message || error);
    return null;
  }
}

export async function getMovieDetails(id: number, mediaType: "movie" | "tv" = "movie"): Promise<MovieItem | null> {
  try {
    const data = await fetchTMDB(`/${mediaType}/${id}`, { language: "en-US" });
    return {
      ...data,
      media_type: mediaType,
    };
  } catch (error: any) {
    console.warn("Notice: TMDB movie details fallback:", error?.message || error);
    return MOCK_MOVIES.find((m) => m.id === id) || null;
  }
}

export async function getWatchProviders(
  id: number,
  mediaType: "movie" | "tv" = "movie",
  countryCode: string = "US"
): Promise<WatchProvidersResult | null> {
  try {
    const data = await fetchTMDB(`/${mediaType}/${id}/watch/providers`);
    const results = data.results || {};
    return results[countryCode] || results["US"] || Object.values(results)[0] || null;
  } catch (error: any) {
    console.warn("Notice: Watch providers fetch fallback:", error?.message || error);
    return null;
  }
}

export function getTMDBImageUrl(path: string | null, size: "w500" | "original" = "w500"): string {
  const defaultFallback = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80";
  if (!path) return defaultFallback;
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export async function getMovieCredits(
  id: number,
  mediaType: "movie" | "tv" = "movie"
): Promise<CastMember[]> {
  try {
    const data = await fetchTMDB(`/${mediaType}/${id}/credits`, { language: "en-US" });
    return (data.cast || []).slice(0, 10).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character || "Cast",
      profile_path: c.profile_path,
    }));
  } catch (error: any) {
    console.warn("Notice: Credits fetch fallback:", error?.message || error);
    return [];
  }
}

export async function getPersonFilmography(
  personId: number
): Promise<{ personName: string; credits: MovieItem[] }> {
  try {
    const [personData, creditsData] = await Promise.all([
      fetchTMDB(`/person/${personId}`, { language: "en-US" }).catch(() => ({})),
      fetchTMDB(`/person/${personId}/combined_credits`, { language: "en-US" }).catch(() => ({ cast: [] })),
    ]);

    const personName = personData.name || "Actor";
    const valid: MovieItem[] = (creditsData.cast || [])
      .filter((m: any) => m.poster_path && (m.title || m.name))
      .sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0))
      .slice(0, 6)
      .map((m: any) => ({
        id: m.id,
        title: m.title || m.name,
        overview: m.overview || "",
        poster_path: m.poster_path,
        backdrop_path: m.backdrop_path,
        release_date: m.release_date || m.first_air_date,
        vote_average: m.vote_average ? Number(m.vote_average.toFixed(1)) : 7.5,
        vote_count: m.vote_count || 500,
        media_type: (m.media_type as "movie" | "tv") || "movie",
      }));

    return { personName, credits: valid };
  } catch (error: any) {
    console.warn("Notice: Person filmography fallback:", error?.message || error);
    return { personName: "Actor", credits: [] };
  }
}

export interface GenreOption {
  id: number;
  name: string;
  emoji: string;
}

export const MOVIE_GENRES: GenreOption[] = [
  { id: 878, name: "Sci-Fi", emoji: "🚀" },
  { id: 53, name: "Thriller", emoji: "🔪" },
  { id: 35, name: "Comedy", emoji: "😂" },
  { id: 18, name: "Drama", emoji: "🎭" },
  { id: 28, name: "Action", emoji: "⚡" },
  { id: 10749, name: "Romance", emoji: "❤️" },
  { id: 27, name: "Horror", emoji: "👻" },
  { id: 9648, name: "Mystery", emoji: "🕵️" },
  { id: 16, name: "Animation", emoji: "🎨" },
  { id: 80, name: "Crime", emoji: "💼" },
  { id: 14, name: "Fantasy", emoji: "🧙" },
  { id: 12, name: "Adventure", emoji: "🗺️" },
  { id: 99, name: "Documentary", emoji: "📽️" },
  { id: 36, name: "History", emoji: "📜" },
];

export interface StreamingPlatform {
  id: number;
  name: string;
  icon: string;
}

export const STREAMING_PLATFORMS: StreamingPlatform[] = [
  { id: 8, name: "Netflix", icon: "🍿" },
  { id: 9, name: "Prime Video", icon: "📦" },
  { id: 337, name: "Disney+", icon: "✨" },
  { id: 350, name: "Apple TV+", icon: "🍏" },
  { id: 1899, name: "Max / HBO", icon: "⚡" },
];

export interface FilterOptions {
  contentType?: "all" | "movie" | "tv" | "documentary";
  genreIds: number[];
  minRating?: number;
  decade?: string;
  sortBy?: "popularity.desc" | "vote_average.desc" | "primary_release_date.desc";
  page?: number;
  providerId?: number;
  watchRegion?: string;
}

export async function discoverMoviesWithFilters(
  filters: FilterOptions
): Promise<{ results: MovieItem[]; totalPages: number; totalResults: number }> {
  try {
    const contentType = filters.contentType || "all";
    const page = filters.page || 1;
    const sortBy = filters.sortBy || "popularity.desc";

    const buildParams = (isTv: boolean) => {
      const p = new URLSearchParams({
        api_key: TMDB_API_KEY,
        language: "en-US",
        include_adult: "false",
        page: String(page),
        sort_by: isTv && sortBy === "primary_release_date.desc" ? "first_air_date.desc" : sortBy,
      });

      let genres = [...filters.genreIds];
      if (contentType === "documentary" && !genres.includes(99)) {
        genres.push(99);
      }

      if (isTv) {
        genres = genres.map((id) => {
          if (id === 878) return 10765;
          if (id === 28 || id === 12) return 10759;
          return id;
        });
      }

      if (genres.length > 0) {
        // TMDB Discover: pipe delimiter "|" represents OR query, ensuring multi-genre combinations return rich results
        p.append("with_genres", genres.join("|"));
      }

      if (filters.minRating && filters.minRating > 0) {
        p.append("vote_average.gte", String(filters.minRating));
        p.append("vote_count.gte", isTv ? "10" : "20");
      } else {
        p.append("vote_count.gte", isTv ? "5" : "10");
      }

      if (filters.decade && filters.decade !== "all") {
        const dateKey = isTv ? "first_air_date" : "primary_release_date";
        if (filters.decade === "2020s") {
          p.append(`${dateKey}.gte`, "2020-01-01");
        } else if (filters.decade === "2010s") {
          p.append(`${dateKey}.gte`, "2010-01-01");
          p.append(`${dateKey}.lte`, "2019-12-31");
        } else if (filters.decade === "2000s") {
          p.append(`${dateKey}.gte`, "2000-01-01");
          p.append(`${dateKey}.lte`, "2009-12-31");
        } else if (filters.decade === "90s") {
          p.append(`${dateKey}.gte`, "1990-01-01");
          p.append(`${dateKey}.lte`, "1999-12-31");
        }
      }

      if (filters.providerId && filters.watchRegion) {
        p.append("with_watch_providers", String(filters.providerId));
        p.append("watch_region", filters.watchRegion);
        p.append("with_watch_monetization_types", "flatrate|free|ads|rent|buy");
      }

      return p;
    };

    if (contentType === "tv") {
      const data = await fetchTMDB("/discover/tv", buildParams(true));
      const results: MovieItem[] = (data.results || []).map((item: any) => ({
        id: item.id,
        title: item.name || item.title || "Untitled",
        overview: item.overview || "",
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        release_date: item.first_air_date || item.release_date,
        first_air_date: item.first_air_date,
        vote_average: item.vote_average ? Number(item.vote_average.toFixed(1)) : 7.0,
        vote_count: item.vote_count || 0,
        media_type: "tv" as const,
      }));
      return { results, totalPages: data.total_pages || 1, totalResults: data.total_results || 0 };
    }

    if (contentType === "movie") {
      const data = await fetchTMDB("/discover/movie", buildParams(false));
      const results: MovieItem[] = (data.results || []).map((item: any) => ({
        id: item.id,
        title: item.title || item.name || "Untitled",
        overview: item.overview || "",
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        release_date: item.release_date || item.first_air_date,
        vote_average: item.vote_average ? Number(item.vote_average.toFixed(1)) : 7.0,
        vote_count: item.vote_count || 0,
        media_type: "movie" as const,
      }));
      return { results, totalPages: data.total_pages || 1, totalResults: data.total_results || 0 };
    }

    // contentType === "all" or "documentary": fetch both
    const [mData, tData] = await Promise.all([
      fetchTMDB("/discover/movie", buildParams(false)).catch(() => ({ results: [], total_pages: 1, total_results: 0 })),
      fetchTMDB("/discover/tv", buildParams(true)).catch(() => ({ results: [], total_pages: 1, total_results: 0 })),
    ]);

    const combined: MovieItem[] = [];
    let totalPages = Math.max(mData.total_pages || 1, tData.total_pages || 1);
    let totalResults = (mData.total_results || 0) + (tData.total_results || 0);

    combined.push(
      ...(mData.results || []).map((item: any) => ({
        id: item.id,
        title: item.title || item.name,
        overview: item.overview || "",
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        release_date: item.release_date || item.first_air_date,
        vote_average: item.vote_average ? Number(item.vote_average.toFixed(1)) : 7.0,
        vote_count: item.vote_count || 0,
        media_type: "movie" as const,
      })),
      ...(tData.results || []).map((item: any) => ({
        id: item.id,
        title: item.name || item.title,
        overview: item.overview || "",
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        release_date: item.first_air_date || item.release_date,
        first_air_date: item.first_air_date,
        vote_average: item.vote_average ? Number(item.vote_average.toFixed(1)) : 7.0,
        vote_count: item.vote_count || 0,
        media_type: "tv" as const,
      }))
    );

    if (sortBy === "vote_average.desc") {
      combined.sort((a, b) => b.vote_average - a.vote_average);
    } else {
      combined.sort((a, b) => b.vote_count - a.vote_count);
    }

    return { results: combined.slice(0, 20), totalPages, totalResults };
  } catch (error: any) {
    console.warn("Notice: Filtered discovery fallback:", error?.message || error);
    return { results: [], totalPages: 0, totalResults: 0 };
  }
}

/**
 * Fetch algorithmic movie/TV recommendations directly from TMDB
 * Uses /recommendations endpoint and augments with /similar if needed
 */
export async function getMovieRecommendations(
  id: number,
  mediaType: "movie" | "tv" = "movie"
): Promise<MovieItem[]> {
  try {
    const data = await fetchTMDB(`/${mediaType}/${id}/recommendations`, {
      language: "en-US",
      page: "1",
    });
    let results: MovieItem[] = (data.results || [])
      .filter((item: any) => item.poster_path && (item.title || item.name))
      .map((item: any) => ({
        id: item.id,
        title: item.title || item.name || "Untitled",
        overview: item.overview || "",
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        release_date: item.release_date || item.first_air_date,
        vote_average: item.vote_average ? Number(item.vote_average.toFixed(1)) : 7.0,
        vote_count: item.vote_count || 0,
        media_type: mediaType,
      }));

    if (results.length < 5) {
      try {
        const simData = await fetchTMDB(`/${mediaType}/${id}/similar`, {
          language: "en-US",
          page: "1",
        });
        const existingIds = new Set(results.map((r) => r.id));
        const simItems = (simData.results || [])
          .filter((item: any) => item.poster_path && !existingIds.has(item.id))
          .map((item: any) => ({
            id: item.id,
            title: item.title || item.name || "Untitled",
            overview: item.overview || "",
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            release_date: item.release_date || item.first_air_date,
            vote_average: item.vote_average ? Number(item.vote_average.toFixed(1)) : 7.0,
            vote_count: item.vote_count || 0,
            media_type: mediaType,
          }));
        results = [...results, ...simItems];
      } catch (e) {}
    }

    return results.slice(0, 10);
  } catch (error: any) {
    console.warn("Notice: Recommendations fetch fallback:", error?.message || error);
    return [];
  }
}
