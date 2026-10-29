"use client";

import { useEffect, useRef, useState } from "react";
import { Film } from "lucide-react";
import { getTMDBImageUrl } from "@/lib/tmdb";

interface PosterImageProps {
  path: string | null;
  title: string;
  size?: "w500" | "w1280" | "original";
  className?: string;
}

export function PosterImage({ path, title, size = "w500", className = "" }: PosterImageProps) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setFailed(false);
  }, [path]);

  // An image can fail before hydration attaches onError
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, [path, failed]);

  if (!path || failed) {
    return (
      <div
        role="img"
        aria-label={title}
        className={`flex items-center justify-center bg-gradient-to-br from-[var(--surface-raised)] via-[var(--surface)] to-[var(--accent-soft)] ${className}`}
      >
        <Film className="w-6 h-6 text-[var(--text-muted)]" aria-hidden />
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={getTMDBImageUrl(path, size)}
      alt={title}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
