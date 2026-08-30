# CineCircle Workspace Rules & Guidelines

## 📌 Context & Feature Architecture Persistence Rule
Whenever new features, Information Architecture changes, UI updates, or technical design decisions are discussed or agreed upon:
1. **Always update [PROJECT_SPECIFICATION.md](file:///Users/vaibhavsharma/Documents/Movie%20recommendor/PROJECT_SPECIFICATION.md)** to keep it as the single authoritative source of truth.
2. **Never drop context** regarding:
   - 5-Star rating system (1.0 - 5.0 with half-stars).
   - Friend management (Add/Remove friends, usernames, Movie/TV character avatars).
   - Hybrid discovery engine (Friend Endorsed Tier + Algorithmic TMDB Tier + Mood Chips).
   - Group Matcher tool ("What Should We Watch Tonight?").
   - 100% free tech stack (Next.js, Supabase, TMDB API, Vercel).

## 🌿 Git Branching & Deployment Strategy Rule
1. **Never commit directly to `main`**:
   - `main` is strictly reserved for stable Production releases (linked to live Production deployment on Vercel with `NEXT_PUBLIC_ENABLE_MOCK_DATA="false"`).
2. **Work exclusively on `staging` or `feat/*` branches**:
   - All active development, testing, and debugging must occur on the `staging` branch (or feature branches branched off `staging`, e.g., `feat/mood-chips`).
   - `staging` is linked to the Vercel Preview/Staging deployment with `NEXT_PUBLIC_ENABLE_MOCK_DATA="true"`.
3. **Releases to `main`**:
   - Only merge `staging` into `main` after all features have been verified and tested on the staging build.
   - Code between `staging` and `main` must remain identical; behavior between environments is strictly driven by the `NEXT_PUBLIC_ENABLE_MOCK_DATA` environment flag.

