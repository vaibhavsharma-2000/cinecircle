export interface CharacterAvatar {
  id: string;
  name: string;
  showMovie: string;
  emoji: string;
  bgColor: string;
  quote: string;
}

export const MOVIE_CHARACTER_AVATARS: CharacterAvatar[] = [
  {
    id: "tony_stark",
    name: "Tony Stark",
    showMovie: "Iron Man / Avengers",
    emoji: "🦾",
    bgColor: "bg-red-900/60 border-red-500/40 text-red-300",
    quote: "I am Iron Man.",
  },
  {
    id: "wednesday_addams",
    name: "Wednesday Addams",
    showMovie: "Wednesday",
    emoji: "🖤",
    bgColor: "bg-purple-950/60 border-purple-500/40 text-purple-300",
    quote: "I act as if I do not care. But I do.",
  },
  {
    id: "luke_skywalker",
    name: "Luke Skywalker",
    showMovie: "Star Wars",
    emoji: "⚔️",
    bgColor: "bg-emerald-950/60 border-emerald-500/40 text-emerald-300",
    quote: "May the Force be with you.",
  },
  {
    id: "michael_scott",
    name: "Michael Scott",
    showMovie: "The Office",
    emoji: "☕",
    bgColor: "bg-blue-950/60 border-blue-500/40 text-blue-300",
    quote: "That's what she said.",
  },
  {
    id: "barbie",
    name: "Barbie",
    showMovie: "Barbie",
    emoji: "💖",
    bgColor: "bg-pink-950/60 border-pink-500/40 text-pink-300",
    quote: "Every day is a good day!",
  },
  {
    id: "batman",
    name: "The Dark Knight",
    showMovie: "Batman",
    emoji: "🦇",
    bgColor: "bg-slate-900 border-slate-700 text-amber-400",
    quote: "I'm Batman.",
  },
  {
    id: "hermione",
    name: "Hermione Granger",
    showMovie: "Harry Potter",
    emoji: "🪄",
    bgColor: "bg-amber-950/60 border-amber-500/40 text-amber-300",
    quote: "When in doubt, go to the library.",
  },
  {
    id: "miles_morales",
    name: "Miles Morales",
    showMovie: "Spider-Man: Into the Spider-Verse",
    emoji: "🕷️",
    bgColor: "bg-rose-950/60 border-rose-500/40 text-rose-300",
    quote: "Anyone can wear the mask.",
  },
];
