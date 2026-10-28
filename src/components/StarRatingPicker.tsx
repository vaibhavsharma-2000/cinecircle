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
                  <Star className={`${starSizeClass} text-[var(--border)]`} />

                  {/* Half-Filled Layer */}
                  {isHalf && (
                    <div className="absolute inset-0 overflow-hidden w-1/2 pointer-events-none">
                      <Star className={`${starSizeClass} fill-[var(--rating)] text-[var(--rating)]`} />
                    </div>
                  )}

                  {/* Full-Filled Layer */}
                  {isFull && (
                    <div className="absolute inset-0 pointer-events-none">
                      <Star className={`${starSizeClass} fill-[var(--rating)] text-[var(--rating)]`} />
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
          <span className="text-xs font-bold text-[var(--rating)] bg-[var(--surface-sunken)] px-2 py-0.5 rounded border border-[var(--border)] shadow-none">
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
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition border cursor-pointer ${
                isSelected
                  ? "bg-[var(--accent)] text-[var(--primary)] border-[var(--accent)] font-extrabold shadow-none"
                  : "bg-transparent text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)]"
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
