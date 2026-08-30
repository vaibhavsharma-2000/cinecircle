"use client";

import { X } from "lucide-react";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  youtubeKey: string | null;
}

export function TrailerModal({ isOpen, onClose, title, youtubeKey }: TrailerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-border)] bg-[var(--canvas)]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-accent)] animate-pulse" />
            <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
              Official Trailer • {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--surface-border)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black">
          {youtubeKey ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeKey}?autoplay=1&rel=0&modestbranding=1`}
              title={`${title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-2 text-[var(--text-muted)] p-8 text-center">
              <span className="text-3xl">🎬</span>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Trailer not found on YouTube for {title}</p>
              <p className="text-xs text-[var(--text-secondary)]">Try searching directly on YouTube or check another title.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
