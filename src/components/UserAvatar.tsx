"use client";

import { getAvatarById } from "@/constants/avatars";

interface UserAvatarProps {
  avatarId?: string;
  displayName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function UserAvatar({
  avatarId = "tony_stark",
  displayName = "User",
  size = "md",
  className = "",
}: UserAvatarProps) {
  const avatar = getAvatarById(avatarId);

  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-12 h-12 text-sm",
    xl: "w-20 h-20 text-xl",
  }[size];

  return (
    <div
      className={`relative rounded-full overflow-hidden border border-white/20 bg-[var(--surface-card)] shrink-0 shadow-sm ${sizeClasses} ${className}`}
    >
      {avatar.imageUrl ? (
        <img
          src={avatar.imageUrl}
          alt={avatar.name || displayName}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initial if image fails to load
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      ) : null}
      <div className="w-full h-full flex items-center justify-center font-black text-[var(--text-primary)] bg-[var(--brand-accent)] text-[var(--brand-accent-text)]">
        {avatar.emoji || displayName[0] || "U"}
      </div>
    </div>
  );
}
