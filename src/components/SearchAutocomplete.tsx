"use client";

import { useState, useEffect, useRef } from "react";
import { searchMovies, getTMDBImageUrl, MovieItem } from "@/lib/tmdb";
import { Search, Sparkles } from "lucide-react";

interface SearchAutocompleteProps {
  onSelectMovie?: (movie: MovieItem) => void;
  expandable?: boolean;
}

export function SearchAutocomplete({ onSelectMovie, expandable = false }: SearchAutocompleteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const res = await searchMovies(query);
      setResults(res.slice(0, 6));
      setIsLoading(false);
      setIsOpen(true);
      setSelectedIndex(-1);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      if (!query && expandable) {
        setIsExpanded(false);
      } else {
        setQuery("");
      }
      return;
    }

    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (onSelectMovie) onSelectMovie(selected);
        setIsOpen(false);
        setQuery("");
        if (expandable) setIsExpanded(false);
      }
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (expandable && !query.trim()) {
          setIsExpanded(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expandable, query]);

  // If expandable and closed, render compact icon button
  if (expandable && !isExpanded) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsExpanded(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        aria-label="Search movies, TV shows"
        title="Search titles, people, genres"
        className="w-9 h-9 rounded-full bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center p-0 shrink-0 transition cursor-pointer"
      >
        <Search className="w-4 h-4 shrink-0" />
      </button>
    );
  }

  return (
    <div className={`relative ${expandable ? "w-60 sm:w-72 md:w-80" : "w-full"} animate-in fade-in duration-200`} ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 pointer-events-none shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="Titles, people, genres..."
          autoFocus={expandable}
          className="w-full h-9 bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] focus:bg-[var(--surface-card)] border border-[var(--surface-border)] focus:border-[var(--brand-accent)] text-xs rounded-full pl-9 pr-8 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none transition duration-150 shadow-sm"
        />
        {(query || expandable) && (
          <button
            type="button"
            onClick={() => {
              if (query) {
                setQuery("");
                setIsOpen(false);
                inputRef.current?.focus();
              } else if (expandable) {
                setIsExpanded(false);
                setIsOpen(false);
              }
            }}
            className="absolute right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
            title={query ? "Clear search" : "Close search"}
          >
            ✕
          </button>
        )}
      </div>

      {/* Autocomplete Results Dropdown */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 w-[340px] sm:w-[420px] md:w-[480px] bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden z-50 divide-y divide-[var(--surface-border)] ${
            expandable ? "right-0" : "left-0 md:left-1/2 md:-translate-x-1/2"
          }`}
        >
          <div className="px-4 py-2.5 text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider flex justify-between bg-[var(--canvas)]">
            <span>{isLoading ? "Searching TMDB..." : "Search Results"}</span>
            <span className="text-[var(--brand-accent)]">{results.length} Found</span>
          </div>

          {results.length === 0 && !isLoading ? (
            <div className="p-4 text-xs text-[var(--text-secondary)] text-center">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            results.map((item, index) => {
              const title = item.title || item.name || "Untitled";
              const releaseYear = (item.release_date || item.first_air_date || "").substring(0, 4);
              const isHighlighted = selectedIndex === index;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (onSelectMovie) onSelectMovie(item);
                    setIsOpen(false);
                    setQuery("");
                    if (expandable) setIsExpanded(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition gap-4 group ${
                    isHighlighted ? "bg-[var(--surface-hover)]" : "hover:bg-[var(--surface-hover)]"
                  }`}
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
