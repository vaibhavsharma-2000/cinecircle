"use client";

import { useState, useEffect, useRef } from "react";
import { searchMovies, getTMDBImageUrl, MovieItem } from "@/lib/tmdb";
import { Search, Sparkles } from "lucide-react";

interface SearchAutocompleteProps {
  onSelectMovie?: (movie: MovieItem) => void;
}

export function SearchAutocomplete({ onSelectMovie }: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const res = await searchMovies(query);
      setResults(res.slice(0, 6));
      setIsLoading(false);
      setIsOpen(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="Search movies, TV shows..."
          className="w-full h-10 bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] focus:bg-[var(--surface-card)] border border-[var(--surface-border)] focus:border-[var(--brand-accent)] text-xs rounded-full pl-10 pr-9 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none transition duration-150 shadow-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Autocomplete Results Dropdown - Wider than the search input bar */}
      {isOpen && (
        <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 w-full md:w-[440px] lg:w-[500px] mt-2 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden z-50 divide-y divide-[var(--surface-border)]">
          <div className="px-4 py-2.5 text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider flex justify-between bg-[var(--canvas)]">
            <span>{isLoading ? "Searching TMDB..." : "Search Results"}</span>
            <span className="text-[var(--brand-accent)]">{results.length} Found</span>
          </div>

          {results.length === 0 && !isLoading ? (
            <div className="p-4 text-xs text-[var(--text-secondary)] text-center">
              No results found for "{query}"
            </div>
          ) : (
            results.map((item) => {
              const title = item.title || item.name || "Untitled";
              const releaseYear = (item.release_date || item.first_air_date || "").substring(0, 4);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (onSelectMovie) onSelectMovie(item);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="p-3.5 hover:bg-[var(--surface-hover)] flex items-center justify-between cursor-pointer transition gap-4 group"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden flex-1">
                    <img
                      src={getTMDBImageUrl(item.poster_path, "w500")}
                      alt={title}
                      className="w-10 h-14 object-cover rounded-xl bg-black/40 shrink-0 border border-[var(--surface-border)] group-hover:scale-105 transition"
                    />
                    <div className="truncate flex-1 space-y-0.5">
                      <h4 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] truncate group-hover:text-[var(--brand-accent)] transition">
                        {title} {releaseYear && <span className="text-[var(--text-secondary)] font-normal text-xs">({releaseYear})</span>}
                      </h4>
                      <p className="text-[11px] text-[var(--text-secondary)] truncate">
                        {item.media_type === "tv" ? "TV Series" : "Feature Film"} • ★ {item.vote_average?.toFixed(1) || "7.0"} TMDB
                      </p>
                      {item.overview && (
                        <p className="text-[10px] text-[var(--text-muted)] truncate hidden sm:block">
                          {item.overview}
                        </p>
                      )}
                    </div>
                  </div>

                  <button className="h-8 bg-[var(--brand-accent)] text-[var(--brand-accent-text)] text-[11px] font-extrabold px-3.5 rounded-full flex items-center gap-1 transition shrink-0 shadow hover:opacity-90">
                    <Sparkles className="w-3 h-3 fill-current" /> Select
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
