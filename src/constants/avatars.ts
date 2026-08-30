export interface CharacterAvatar {
  id: string;
  name: string;
  showMovie: string;
  category: "Popular" | "Superheroes" | "Sci-Fi & Fantasy" | "Cult TV Shows" | "Anime & Animation" | "Cinema Classics";
  imageUrl: string;
  emoji: string;
  bgColor: string;
  quote: string;
}

export const MOVIE_CHARACTER_AVATARS: CharacterAvatar[] = [
  // --- Popular ---
  {
    id: "tony_stark",
    name: "Tony Stark",
    showMovie: "Iron Man / Avengers",
    category: "Popular",
    imageUrl: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=300&q=80",
    emoji: "🦾",
    bgColor: "bg-red-900/60 border-red-500/40 text-red-300",
    quote: "I am Iron Man.",
  },
  {
    id: "wednesday_addams",
    name: "Wednesday Addams",
    showMovie: "Wednesday",
    category: "Popular",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    emoji: "🖤",
    bgColor: "bg-purple-950/60 border-purple-500/40 text-purple-300",
    quote: "I act as if I do not care. But I do.",
  },
  {
    id: "miles_morales",
    name: "Miles Morales",
    showMovie: "Spider-Man: Across the Spider-Verse",
    category: "Popular",
    imageUrl: "https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=300&q=80",
    emoji: "🕷️",
    bgColor: "bg-rose-950/60 border-rose-500/40 text-rose-300",
    quote: "Anyone can wear the mask.",
  },
  {
    id: "barbie",
    name: "Barbie",
    showMovie: "Barbie",
    category: "Popular",
    imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=300&q=80",
    emoji: "💖",
    bgColor: "bg-pink-950/60 border-pink-500/40 text-pink-300",
    quote: "Every day is a good day!",
  },
  {
    id: "batman",
    name: "The Dark Knight",
    showMovie: "Batman",
    category: "Popular",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80",
    emoji: "🦇",
    bgColor: "bg-slate-900 border-slate-700 text-amber-400",
    quote: "I'm Batman.",
  },
  {
    id: "luke_skywalker",
    name: "Luke Skywalker",
    showMovie: "Star Wars",
    category: "Popular",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80",
    emoji: "⚔️",
    bgColor: "bg-emerald-950/60 border-emerald-500/40 text-emerald-300",
    quote: "May the Force be with you.",
  },

  // --- Superheroes & Comics ---
  {
    id: "joker",
    name: "The Joker",
    showMovie: "The Dark Knight",
    category: "Superheroes",
    imageUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=300&q=80",
    emoji: "🃏",
    bgColor: "bg-purple-900/60 border-purple-500/40 text-purple-300",
    quote: "Why so serious?",
  },
  {
    id: "deadpool",
    name: "Deadpool",
    showMovie: "Deadpool & Wolverine",
    category: "Superheroes",
    imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=300&q=80",
    emoji: "⚔️",
    bgColor: "bg-red-950/60 border-red-500/40 text-red-300",
    quote: "Maximum effort!",
  },
  {
    id: "wanda",
    name: "Scarlet Witch",
    showMovie: "WandaVision / Doctor Strange",
    category: "Superheroes",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    emoji: "🔮",
    bgColor: "bg-crimson-950/60 border-red-500/40 text-red-300",
    quote: "You have no idea what is possible.",
  },
  {
    id: "spider_man_peter",
    name: "Peter Parker",
    showMovie: "Spider-Man: No Way Home",
    category: "Superheroes",
    imageUrl: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=300&q=80",
    emoji: "🕸️",
    bgColor: "bg-blue-950/60 border-blue-500/40 text-blue-300",
    quote: "With great power comes great responsibility.",
  },

  // --- Sci-Fi & Fantasy ---
  {
    id: "paul_atreides",
    name: "Paul Atreides",
    showMovie: "Dune: Part Two",
    category: "Sci-Fi & Fantasy",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80",
    emoji: "🏜️",
    bgColor: "bg-amber-950/60 border-amber-500/40 text-amber-300",
    quote: "Fear is the mind-killer.",
  },
  {
    id: "neo",
    name: "Neo",
    showMovie: "The Matrix",
    category: "Sci-Fi & Fantasy",
    imageUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
    emoji: "🕶️",
    bgColor: "bg-emerald-950/60 border-emerald-500/40 text-emerald-300",
    quote: "I know kung fu.",
  },
  {
    id: "hermione",
    name: "Hermione Granger",
    showMovie: "Harry Potter",
    category: "Sci-Fi & Fantasy",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
    emoji: "🪄",
    bgColor: "bg-amber-950/60 border-amber-500/40 text-amber-300",
    quote: "When in doubt, go to the library.",
  },
  {
    id: "geralt",
    name: "Geralt of Rivia",
    showMovie: "The Witcher",
    category: "Sci-Fi & Fantasy",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    emoji: "🐺",
    bgColor: "bg-slate-900 border-slate-700 text-slate-300",
    quote: "Hmm.",
  },

  // --- Cult TV Shows ---
  {
    id: "michael_scott",
    name: "Michael Scott",
    showMovie: "The Office",
    category: "Cult TV Shows",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    emoji: "☕",
    bgColor: "bg-blue-950/60 border-blue-500/40 text-blue-300",
    quote: "That's what she said.",
  },
  {
    id: "eleven",
    name: "Eleven",
    showMovie: "Stranger Things",
    category: "Cult TV Shows",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    emoji: "🧇",
    bgColor: "bg-purple-950/60 border-purple-500/40 text-purple-300",
    quote: "Friends don't lie.",
  },
  {
    id: "walter_white",
    name: "Walter White",
    showMovie: "Breaking Bad",
    category: "Cult TV Shows",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
    emoji: "🧪",
    bgColor: "bg-yellow-950/60 border-yellow-500/40 text-yellow-300",
    quote: "I am the one who knocks.",
  },
  {
    id: "thomas_shelby",
    name: "Tommy Shelby",
    showMovie: "Peaky Blinders",
    category: "Cult TV Shows",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
    emoji: "🚬",
    bgColor: "bg-slate-900 border-slate-700 text-amber-200",
    quote: "By order of the Peaky Blinders.",
  },

  // --- Anime & Animation ---
  {
    id: "jinx_arcane",
    name: "Jinx",
    showMovie: "Arcane / League of Legends",
    category: "Anime & Animation",
    imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=300&q=80",
    emoji: "💣",
    bgColor: "bg-cyan-950/60 border-cyan-500/40 text-cyan-300",
    quote: "I'm crazy! Got a doctor's note.",
  },
  {
    id: "goku",
    name: "Goku",
    showMovie: "Dragon Ball Z",
    category: "Anime & Animation",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=300&q=80",
    emoji: "🔥",
    bgColor: "bg-orange-950/60 border-orange-500/40 text-orange-300",
    quote: "I am the hope of the universe!",
  },
  {
    id: "totoro",
    name: "Totoro",
    showMovie: "My Neighbor Totoro",
    category: "Anime & Animation",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80",
    emoji: "🍃",
    bgColor: "bg-emerald-950/60 border-emerald-500/40 text-emerald-300",
    quote: "Forest Spirit.",
  },

  // --- Cinema Classics ---
  {
    id: "indiana_jones",
    name: "Indiana Jones",
    showMovie: "Raiders of the Lost Ark",
    category: "Cinema Classics",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    emoji: "🤠",
    bgColor: "bg-amber-950/60 border-amber-500/40 text-amber-300",
    quote: "It belongs in a museum!",
  },
  {
    id: "mia_wallace",
    name: "Mia Wallace",
    showMovie: "Pulp Fiction",
    category: "Cinema Classics",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    emoji: "💃",
    bgColor: "bg-red-950/60 border-red-500/40 text-red-300",
    quote: "Don't be a square.",
  },
  {
    id: "vito_corleone",
    name: "Vito Corleone",
    showMovie: "The Godfather",
    category: "Cinema Classics",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    emoji: "🌹",
    bgColor: "bg-stone-900 border-stone-700 text-stone-300",
    quote: "An offer he can't refuse.",
  },
];

export function getAvatarById(id: string): CharacterAvatar {
  const found = MOVIE_CHARACTER_AVATARS.find((a) => a.id === id);
  if (found) return found;
  return MOVIE_CHARACTER_AVATARS[0]; // Fallback to Tony Stark
}
