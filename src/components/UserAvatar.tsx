"use client";

import Avvvatars from "avvvatars-react";

interface UserAvatarProps {
  avatarId?: string;
  displayName?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function UserAvatar({
  avatarId,
  displayName = "User",
  size = "md",
  className = "",
}: UserAvatarProps) {
  const sizeMap = {
    sm: 24,
    md: 36,
    lg: 48,
    xl: 64,
    "2xl": 80,
  };

  const numericSize = sizeMap[size] || 36;
  const seed = (avatarId && avatarId.trim()) || displayName || "cinecircle";

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden shadow-sm transition-transform ${className}`}
      style={{ width: numericSize, height: numericSize }}
    >
      <Avvvatars
        value={seed}
        style="shape"
        size={numericSize}
        shadow={false}
      />
    </div>
  );
}
