# CineCircle - Project Specification & Architecture

## Overview
CineCircle is a private, UX-first movie and TV show recommendation platform designed for friend circles (10–20 users). It combines high-trust friend reviews with smart algorithmic discovery powered by TMDB. Durable product context is recorded in [PRODUCT.md](file:///Users/vaibhavsharma/Documents/Movie%20recommendor/PRODUCT.md) and design specifications are in [DESIGN_SYSTEM.md](file:///Users/vaibhavsharma/Documents/Movie%20recommendor/DESIGN_SYSTEM.md).

---

## 🎨 Design System & Color Palette (Minimalist Black & White)
- **Component Engine**: Built entirely with authentic Fragments UI (`@usefragments/ui`) component primitives.
- **Minimalist Monochrome Dual-Mode Palette**:
  - **Dark Mode**: Pitch Black `#000000` canvas, pitch black `#000000` cards, subtle `#222222` borders, stark white `#ffffff` primary text & buttons, `#f59e0b` gold stars.
  - **Light Mode**: Seamless Pure White `#ffffff` site canvas & white cards, clean `#eaeaea` borders, stark pitch black `#000000` primary text & buttons, `#f59e0b` gold stars.
- **Rounded Visual Style**: Standardized on Fragments UI signature rounded geometry (`rounded-2xl`, `rounded-full` pills).

---

## 🧭 Header Navigation & Profile Avatar Dropdown
- **Streamlined Single-Row Layout**: Ultra-clean header featuring Logo on the left, compact Search bar (`md:w-64`), single unified segmented control pill navigation bar in the middle, and profile avatar dropdown menu on the right.
- **Unified Segmented Pill Navigation Bar**: Groups all 5 main view pills (*Discover, Recommendations, Watchlist, Group Matcher, Friends*) inside a single minimalist container (`bg-[var(--surface-card)] p-1 rounded-full`), keeping horizontal space compact and clutter-free.
- **Avatar Profile Dropdown Menu**: Clicking the user avatar opens a floating menu containing:
  - User Handle & Email header (@username)
  - ⚙️ **Account & Settings**
  - 🌙 / ☀️ **Theme Switcher** (Integrated inside dropdown menu to eliminate standalone navbar button clutter)
  - 🚪 **Sign Out** / 🔑 **Sign In**

---

## ⚙️ Account Settings, Security & Session Persistence
- **Durable Session Persistence**: Supabase Auth configured with `persistSession: true`, `autoRefreshToken: true`, `detectSessionInUrl: true`, and explicit storage key `cinecircle_auth_session`. Users remain logged in even after closing the browser tab or restarting their device.
- **LocalStorage Fallback Persistence**: Local application state (`cinecircle_user_profile`, `cinecircle_user_email`, `cinecircle_watchlist`) is cached to `localStorage` so testing and demo sessions are preserved seamlessly across browser restarts.
- **Reorganized 2-Tab Navigation**:
  - 👤 **Profile Details**: Update Display Name, Circle Handle (@username), Age, and Pop-Culture Character Avatar (*Tony Stark, Wednesday, Luke Skywalker, Michael Scott, Barbie, Batman, Hermione, Miles Morales*).
  - 🔑 **Account Settings**:
    - **Password Management**: Switch between two clear methods: **Enter New Password Directly** (`updateUser`) or **Send Password Reset Email Link** (`resetPasswordForEmail`).
    - **Danger Zone**: Integrated Account Deletion section with double confirmation dialog to permanently remove user account and data.

---

## 🍪 Cookie & Local Storage Consent System
- **Floating Consent Banner**: Appears smoothly at the bottom-left of the screen on first visit (`Accept All`, `Customize Preferences`, `Essential Only`).
- **Granular Cookie Preferences Modal**: Allows users to inspect and toggle:
  1. **Essential Authentication & Session Storage** (Always Active — keeps users signed in across tab closes).
  2. **Functional & UI Preferences** (Saves dark/light mode preference and custom avatar choices).
  3. **Personalized TMDB Discovery & Analytics** (Optimizes genre collections based on circle activity).

---

## 👥 Friend Circle Recommendation Feed & Dedicated Recommendations Page
- **Dedicated Recommendations View**: Separate primary tab for full recommendation feed. The main **Discover** landing page previews the 3 most recent recommendations with a direct button leading to the dedicated **Recommendations** page.
- **Recommendation Modal**: Includes friend search bar, full-width optional review note textarea, star rating, and dynamic **Custom Tag Creation** (#tags).
- **Live Supabase Multi-User Sync & Realtime WebSockets**: Recommendations, comments, user watchlists, and profile updates synchronize directly to Supabase (`recommendations`, `recommendation_comments`, `watchlist`, `profiles`). Authenticated users automatically receive live updates via WebSocket subscriptions (`postgres_changes`), rendering new recommendations and comments immediately without page refresh.
- **1-Click Friend Invite Links (`/?invite=${username}`)**: Users can generate personalized invite links from the Friends tab with 1-click **Copy Link**, **WhatsApp**, and **iMessage/SMS** sharing. When a friend opens the link, the app automatically stages the mutual circle connection and presents a celebration banner (*"🎉 You've joined @username's CineCircle"*).
- **Row Level Security (RLS)**: Enabled across all Postgres tables (`profiles`, `friendships`, `recommendations`, `watchlist`, `recommendation_comments`) with granular security policies preventing unauthorized mutation while allowing circle members to view recommendations.
- **Supabase Comments Thread**: `recommendation_comments` table created in Supabase Postgres with RLS policies enabled. Comments are loaded dynamically and saved directly to the database with realtime live updates.
- **Recommendation Deletion with Confirmation Overlay**: Each feed item features a trash trigger button (🗑️). Clicking it opens a **Delete Recommendation Overlay** modal asking for explicit user confirmation before deletion, which purges the record from both UI state and Supabase.

---

## 🤖 Expandable TMDB Algorithmic Discovery Stream
- **Dynamic Pagination**: Includes an **`Explore More Titles`** button that fetches next pages dynamically from the TMDB API (`page=2`, `page=3`) and appends results without page reload.
- **7 Curated Collections**: *Top Rated & Masterpieces*, *Trending Now*, *Rom-Coms & Feel-Good*, *High-Stakes Thrillers*, *Mind-Bending Sci-Fi*, *Crowd Comedies*, *Award Winners & Dramas*.

---

## 🎰 Group Watch Decision Engine & Watch Roulette
- **Group Consensus Overlap**: Calculates mutual watchlist intersections between selected circle members to solve "What should we watch tonight?".
- **Watch Roulette Feature (`WatchRouletteModal`)**: Interactive casino/film-reel randomizer with quadratic easing velocity animation (fast shuffle gradually slowing over 3.5s). Lands dramatically on the winning consensus film with celebratory particle confetti, direct **"Watch Trailer"** action, and **"Spin Again 🎲"** re-roll capability.

---

## 📺 Regional Streaming Intelligence & Cast Exploration
- **Multi-Country Streaming Selector**: Country toggle ordered by priority (🇩🇪 Germany, 🇮🇳 India, 🇨🇦 Canada, 🇺🇸 USA, 🇬🇧 UK, 🇦🇺 Australia) dynamically queries TMDB for regional watch providers.
- **Persistent User Choice**: The user's selected streaming country is automatically saved to `localStorage` (`cinecircle_streaming_country`) with Germany (`DE`) as the default fallback, eliminating redundant clicks across movies and sessions.
- **Top Cast & Crew Row**: Horizontal scrolling avatars in `MovieDetailModal` highlighting top billed cast and characters.
- **Cast Filmography Drawer (`CastFilmographyModal`)**: Clicking any actor or director opens their top-rated filmography with 1-click **"Watch Trailer"**, **"Add to Watchlist"**, and instant modal view transition.

---

## 🌿 Git Branching & Environment Isolation Architecture
- **Environment Flag Driven**: Codebase is 100% identical between `main` and `staging`. Toggled dynamically via `NEXT_PUBLIC_ENABLE_MOCK_DATA`:
  - **Staging / Dev Mode (`NEXT_PUBLIC_ENABLE_MOCK_DATA="true"`)**: Preloads mock circle members (*Alex, Maya, Sam*), demo recommendations, and testing user profile (`tony.stark@avengers.io`) for rapid UI validation.
  - **Production Mode (`NEXT_PUBLIC_ENABLE_MOCK_DATA="false"`)**: Clean state with zero mock data. Real authentication sessions and direct Supabase database querying only.
- **Branching Workflow**:
  - `main`: Production release branch linked to production Vercel deployment (`NEXT_PUBLIC_ENABLE_MOCK_DATA="false"`). Direct commits strictly forbidden.
  - `staging`: Primary integration & testing branch linked to Vercel preview deployment (`NEXT_PUBLIC_ENABLE_MOCK_DATA="true"`).
  - `feat/*`: Feature branches branched from and merged back into `staging`.

---

## Technical Stack Architecture
- **Frontend**: Next.js 15 (App Router, TypeScript, Tailwind CSS, `@usefragments/ui`, Lucide React icons)
- **Database & Auth**: Supabase (Postgres Database, Row Level Security, Supabase Auth)
- **External Data**: TMDB API v3 (Paginated Search & Discovery, Watch Providers, YouTube Trailers)
- **Analytics & Observability**: `@vercel/analytics` integrated into Root Layout (`<Analytics />`) for privacy-friendly real-time audience metrics.
- **PWA & Mobile App Shell**: Full Progressive Web App support via `/manifest.json`, viewport theme controls (`#000000`), standalone fullscreen display, maskable SVG icons, and interactive `InstallPwaModal` guiding iOS Safari and Android Chrome home screen installation.
