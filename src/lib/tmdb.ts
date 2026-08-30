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

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "d1063e408496911ca74bc7a968b9cf95";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

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
    const res = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        query
      )}&include_adult=false&language=en-US&page=1`
    );
    if (!res.ok) throw new Error("TMDB search failed");
    const data = await res.json();
    return (data.results || []).filter(
      (item: MovieItem) => item.poster_path && (item.title || item.name)
    );
  } catch (error) {
    console.error("Error searching TMDB:", error);
    return MOCK_MOVIES.filter((m) =>
      m.title.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export async function getTrendingMovies(): Promise<MovieItem[]> {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}&language=en-US`
    );
    if (!res.ok) throw new Error("TMDB trending failed");
    const data = await res.json();
    return (data.results || []).filter(
      (item: MovieItem) => item.poster_path && (item.title || item.name)
    );
  } catch (error) {
    console.error("Error fetching trending from TMDB:", error);
    return MOCK_MOVIES;
  }
}

export async function getMoviesByCategory(
  categoryId: string,
  page: number = 1
): Promise<MovieItem[]> {
  const category = DISCOVERY_CATEGORIES.find((c) => c.id === categoryId) || DISCOVERY_CATEGORIES[0];

  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&${category.params}&include_adult=false&language=en-US&page=${page}`
    );
    if (!res.ok) throw new Error("TMDB discover failed");
    const data = await res.json();
    return (data.results || []).filter((item: MovieItem) => item.poster_path);
  } catch (error) {
    console.error("Error discovering movies from TMDB:", error);
    return MOCK_MOVIES;
  }
}

export async function getMovieTrailerKey(id: number, mediaType: "movie" | "tv" = "movie"): Promise<string | null> {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const videos = data.results || [];
    
    const trailer =
      videos.find((v: { site: string; type: string; key: string }) => v.site === "YouTube" && v.type === "Trailer") ||
      videos.find((v: { site: string; type: string; key: string }) => v.site === "YouTube" && v.type === "Teaser") ||
      videos[0];

    return trailer ? trailer.key : null;
  } catch (error) {
    console.error("Error fetching trailer from TMDB:", error);
    return null;
  }
}

export async function getMovieDetails(id: number, mediaType: "movie" | "tv" = "movie"): Promise<MovieItem | null> {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      ...data,
      media_type: mediaType,
    };
  } catch (error) {
    console.error("Error fetching movie details from TMDB:", error);
    return MOCK_MOVIES.find((m) => m.id === id) || null;
  }
}

export async function getWatchProviders(
  id: number,
  mediaType: "movie" | "tv" = "movie",
  countryCode: string = "US"
): Promise<WatchProvidersResult | null> {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}/watch/providers?api_key=${TMDB_API_KEY}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const results = data.results || {};
    return results[countryCode] || results["US"] || Object.values(results)[0] || null;
  } catch (error) {
    console.error("Error fetching watch providers:", error);
    return null;
  }
}

export function getTMDBImageUrl(path: string | null, size: "w500" | "original" = "w500"): string {
  const defaultFallback = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80";
  if (!path) return defaultFallback;
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
