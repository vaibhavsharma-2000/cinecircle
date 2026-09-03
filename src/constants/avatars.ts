export interface CharacterAvatar {
  id: string;
  name: string;
  showMovie: string;
  imageUrl: string;
  emoji: string;
}

export const AVVVATAR_PRESETS: string[] = [
  "solaris",
  "aurora",
  "nebula",
  "zenith",
  "ember",
  "ocean",
  "matrix",
  "cosmo",
  "prism",
  "velvet",
  "cipher",
  "flux",
  "pulse",
  "vortex",
  "hyper",
  "glitch",
  "quantum",
  "plasma",
  "nova",
  "shadow",
  "citrus",
  "mystic",
  "atlas",
  "chrono",
  "titan",
  "phoenix",
  "arcade",
  "orbit",
  "pixel",
  "spark",
  "echo",
  "frost",
  "dynamo",
  "blaze",
  "radiant",
  "quartz",
  "sapphire",
  "topaz",
  "emerald",
  "amethyst",
  "onyx",
  "ruby",
];

export const DEFAULT_AVATAR_ID = "solaris";

export function getAvatarById(id: string): CharacterAvatar {
  return {
    id: id || DEFAULT_AVATAR_ID,
    name: "",
    showMovie: "",
    imageUrl: "",
    emoji: "🎬",
  };
}
