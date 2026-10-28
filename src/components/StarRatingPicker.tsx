"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingPickerProps {
  rating: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function StarRatingPicker({
  rating,
  onChange,
  size = "md",
  showLabel = true,
}: StarRatingPickerProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeRating = hoverRating !== null ? hoverRating : rating;

  const starSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const starSizeClass = starSizes[size];

  const quickPresets = [1.0, 2.0, 3.0, 3.5, 4.0, 4.5, 5.0];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3">
        {/* Interactive 5-Star Row with Left/Right Half Click Targets */}
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHoverRating(null)}
        >
          {[1, 2, 3, 4, 5].map((starIndex) => {
            const isFull = activeRating >= starIndex;
            const isHalf = !isFull && activeRating >= starIndex - 0.5;

            return (
              <div
                key={starIndex}
                className="relative cursor-pointer transition-transform hover:scale-110"
              >
                {/* Visual Star */}
                <div className="relative">
                  {/* Base / Empty Star */}
                  <Star className={`${starSizeClass} text-[var(--text-muted)]`} />

                  {/* Half-Filled Layer */}
                  {isHalf && (
                    <div className="absolute inset-0 overflow-hidden w-1/2 pointer-events-none">
                      <Star className={`${starSizeClass} fill-[var(--star-accent)] text-[var(--star-accent)]`} />
                    </div>
                  )}

                  {/* Full-Filled Layer */}
                  {isFull && (
                    <div className="absolute inset-0 pointer-events-none">
                      <Star className={`${starSizeClass} fill-[var(--star-accent)] text-[var(--star-accent)]`} />
                    </div>
                  )}
                </div>

                {/* Left Half Target (starIndex - 0.5) */}
                <button
                  type="button"
                  aria-label={`Rate ${starIndex - 0.5} stars`}
                  onClick={() => onChange(starIndex - 0.5)}
                  onMouseEnter={() => setHoverRating(starIndex - 0.5)}
                  className="absolute inset-y-0 left-0 w-1/2 z-10 cursor-pointer opacity-0"
                />

                {/* Right Half Target (starIndex) */}
                <button
                  type="button"
                  aria-label={`Rate ${starIndex} stars`}
                  onClick={() => onChange(starIndex)}
                  onMouseEnter={() => setHoverRating(starIndex)}
                  className="absolute inset-y-0 right-0 w-1/2 z-10 cursor-pointer opacity-0"
                />
              </div>
            );
          })}
        </div>

        {/* Dynamic Numerical Badge */}
        {showLabel && (
          <span className="text-xs font-black text-[var(--star-accent)] bg-[var(--surface-sunken)] px-2.5 py-0.5 rounded-full border border-[var(--surface-border)] shadow-xs">
            ★ {activeRating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Quick Half-Star Preset Pills */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        {quickPresets.map((preset) => {
          const isSelected = rating === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition border cursor-pointer ${
                isSelected
                  ? "bg-[var(--star-accent)] text-slate-950 border-[var(--star-accent)] font-black shadow-xs"
                  : "bg-[var(--canvas)] text-[var(--text-secondary)] border-[var(--surface-border)] hover:text-[var(--text-primary)] hover:border-[var(--brand-accent)]"
              }`}
            >
              ★ {preset.toFixed(1)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
