# CineCircle - Project Specification & Architecture

## Overview
CineCircle is a private, UX-first movie and TV show recommendation platform designed for friend circles (10–20 users). It combines high-trust friend reviews with smart algorithmic discovery powered by TMDB. Durable product context is recorded in [PRODUCT.md](file:///Users/vaibhavsharma/Documents/Movie%20recommendor/PRODUCT.md) and design specifications are in [DESIGN_SYSTEM.md](file:///Users/vaibhavsharma/Documents/Movie%20recommendor/DESIGN_SYSTEM.md).

---

## 🎨 Design System & Color Palette ("Soft White, Sage & Deep Olive")
- **Component Engine**: Built entirely with authentic Fragments UI (`@usefragments/ui`) component primitives.
- **Calm Minimal Editorial Palette**:
  - **Light Mode (`:root` / `[data-theme="light"]`)**:
    - `bg`: `#E8E9DF` (Soft paper-like cream background)
    - `surface`: `#F3F4EC` (Cards, nav bar, modals)
    - `surface-raised`: `#FAFAF5` (Elevated cards and modal elements)
    - `surface-sunken`: `#DCDECF` (Input fields, inset quote blocks, table stripes)
    - `border`: `#CDD0BC` (Hairline 1px borders & dividers)
    - `text`: `#1B2418` (Deep olive body text and headings)
    - `text-muted`: `#5B6753` (Secondary text, metadata, runtime, timestamps)
    - `primary`: `#2E3D28` (Primary buttons, active item fills)
    - `primary-hover`: `#3A4C33` | `primary-active`: `#243020` | `on-primary`: `#E8E9DF`
    - `secondary`: `#2E3D28` (Secondary button border & text, hover: `--accent-soft`)
    - `accent`: `#A9B887` (Sage accent fill / active chip fill with `#2E3D28` text)
    - `accent-soft`: `#D3D9BE` (Chip/tag fill with `--text`)
    - `accent-text`: `#4F6338` (High-contrast links & action accents)
    - `rating`: `#6F8450` (Olive-gold reserved for star ratings)
    - `success`: `#4F7A3E` | `danger`: `#A8402F` | `focus-ring`: `#4F6338`
  - **Dark Mode (`@media (prefers-color-scheme: dark)` / `[data-theme="dark"]`)**:
    - `bg`: `#1A2217` (Deep olive night background)
    - `surface`: `#232F1E` (Cards, nav bar, modals)
    - `surface-raised`: `#2E3D28` (Elevated components)
    - `surface-sunken`: `#131A11` (Input fields, inset trays)
    - `border`: `#3C4B35` (Hairline dividers)
    - `text`: `#E8E9DF` (Soft cream text)
    - `text-muted`: `#A7AE9A` (Muted secondary text)
    - `primary`: `#A9B887` (Sage primary buttons)
    - `primary-hover`: `#BCC99D` | `primary-active`: `#94A474` | `on-primary`: `#1A2217`
    - `secondary`: `#A9B887`
    - `accent`: `#A9B887` | `accent-soft`: `#2E3D28` | `accent-text`: `#BCC99D`
    - `rating`: `#A9B887` (Sage star ratings)
    - `success`: `#8FBF7A` | `danger`: `#D9695A` | `focus-ring`: `#BCC99D`
- **Visual Style Cues**:
  - Generous whitespace and a soft, paper-like page background (`--bg`).
  - Hairline 1px borders (`--border`) without heavy dropshadows (`shadow-none` or subtle).
  - Navigation and small metadata labels in uppercase with wide letter-spacing (`tracking-wider`).
  - Strict WCAG AA contrast compliance: `--accent` (#A9B887) is never used as raw text on soft white backgrounds.
  - Dual theme persistence with zero-flash inline hydration script in `layout.tsx`.

---

## 🧭 Header Navigation & Profile Avatar Dropdown
- **Branded Logo Asset & Presentation**: Uses high-resolution emblem `/logo.png` (610x610) featuring the 3D film reel 'C', play button, and sparkles presented inside a refined squircle tile (`rounded-xl` with hairline border, subtle surface elevation, and `object-contain`), completely eliminating circular clipping and awkward text truncation. The full horizontal artwork with editorial wordmark is preserved at `/logo-full.png`.
- **Netflix-Inspired Information Architecture (Left Destinations, Right Utilities)**:
  - **Left Section (Brand & Destinations)**: Brand logo and wordmark immediately adjacent to primary navigation links (*Discover, Feeds, Library, Matcher, Friends*). Tabs are text-first, editorial, and compact without icon clutter, maximizing horizontal breathing room.
  - **Right Section (Utilities Cluster)**: Grouped on the far right:
    - **Netflix-Style Expandable Search**: Idle search sits as a compact 36px icon button (`[ 🔍 ]`). On click, smoothly slides open to `240px–320px` with auto-focus, keyboard navigation, and an instant TMDB autocomplete dropdown anchored to the right edge. Auto-collapses on Escape or outside click when empty.
    - **Quick Theme Switcher**: 1-click Moon / Sun toggle.
    - **User Profile / Sign In Pill**: User avatar with display name and floating account settings menu.
- **Distinct Active Navigation Indicator**: The active navigation tab features bold contrast styling (`text-[var(--text)] font-black`), subtle sunken highlight background (`bg-[var(--surface-sunken)]/60`), and a dedicated solid primary underline bar (`h-[2.5px] bg-[var(--primary)] rounded-full`), making the active tab immediately recognizable across both desktop and mobile viewports.
- **Button & Badge Anti-Wrapping Safeguards**: Component-level whitespace and flex-alignment formatting applied across buttons, badges, and rating elements (including Fragments UI `icon` prop integration) to prevent text clipping without interfering with container or card layouts.
- **Avatar Profile Dropdown Menu**: Clicking the user avatar opens a floating menu containing:
  - User Handle & Email header (@username)
  - ⚙️ **Account & Settings**
  - 🌙 / ☀️ **Theme Switcher** (Integrated inside dropdown menu to eliminate standalone navbar button clutter)
  - 🚪 **Sign Out** / 🔑 **Sign In**

---

## ⚙️ Account Settings, Security & Session Persistence
- **Durable Session Persistence**: Supabase Auth configured with `persistSession: true`, `autoRefreshToken: true`, `detectSessionInUrl: true`, and explicit storage key `cinecircle_auth_session`. Users remain logged in even after closing the browser tab or restarting their device.
- **Per-User Scoped LocalStorage & State Isolation**: Application state is isolated per user (`${STORAGE_PREFIX}watchlist_${userId}`, `${STORAGE_PREFIX}user_profile`, etc.) and automatically purged on logout. When an authenticated user logs in, their Supabase watchlist is the authoritative source of truth, preventing cross-account state leakage when switching between test or circle accounts on the same browser.
- **Reorganized 2-Tab Navigation**:
  - 👤 **Profile Details**: Update Display Name, Circle Handle (@username), Age, and Pop-Culture Character Avatar (*Tony Stark, Wednesday, Luke Skywalker, Michael Scott, Barbie, Batman, Hermione, Miles Morales*).
  - 🔑 **Account Settings**:
    - **Password Management**: Switch between two clear methods: **Enter New Password Directly** (`updateUser`) or **Send Password Reset Email Link** (`resetPasswordForEmail`).
    - **Danger Zone**: Integrated Account Deletion section with double confirmation dialog to permanently remove user account and data.
- **Browser Autofill & Credential Management Heuristics**:
  - All authentication and credential forms (`AuthModal`, `CompleteProfileModal`, `AccountModal`) adhere to WHATWG / HTML5 Credential Management standards (`method="post"`, `autoComplete="on"`, `action="#"`).
  - Standardized explicit element identifiers (`id`) and corresponding `<label htmlFor="...">` associations.
  - Granular `autoComplete` attributes: `autoComplete="username email"` / `autoComplete="email"` for user identity, `autoComplete="current-password"` for login authentication, `autoComplete="new-password"` for account registration and password updates, `autoComplete="name"` for full name, and `autoComplete="username"` for circle handles.
  - Direct password update forms include hidden contextually-linked `name="username"` inputs so native browser keychains and credential managers (macOS Keychain, Chrome Passwords, 1Password, Bitwarden) reliably identify the active account and prompt to save or update credentials.
- **Authentication Modal Lifecycle & Clean Slate Reset**:
  - `AuthModal` automatically performs a complete state purge (`resetForm`) upon modal close, dismissal, and reopening via `useEffect([isOpen])`.
  - Clears half-typed fields (`email`, `password`, `confirmPassword`, `displayName`, `username`, `age`), toggles password visibility back to hidden, clears stale error alerts (`errorMsg = null`), and returns mode to default `"SIGN_IN"`.
  - Prevents sensitive plain text credentials or invalid validation messages from lingering in memory or in the DOM across reopenings.
  - Universal backdrop overlay dismiss: Clicking outside modal cards (`fixed inset-0` with `cursor-pointer` and inner `e.stopPropagation()`) across `AuthModal`, `AccountModal`, `AvatarPickerModal`, `MovieDetailModal`, `FriendLibraryModal`, `RecommendModal`, and `WatchRouletteModal` smoothly dismisses the overlay.

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
- **Recommendation Modal State Management**: Full-width optional review note textarea, 1.0–5.0 star rating, friend search bar, and dynamic **Custom Tag Creation** (#tags). Form state cleanly resets upon opening, submitting, or switching movies.
- **Live Supabase Multi-User Sync & Realtime WebSockets**: Recommendations, comments, user watchlists, and profile updates synchronize directly to Supabase (`recommendations`, `recommendation_comments`, `watchlist`, `profiles`). Authenticated users automatically receive live updates via WebSocket subscriptions (`postgres_changes`), rendering new recommendations and comments immediately without page refresh.
- **1-Click Mutual Friend Invite Links (`/?invite=${username}`)**: Users can generate personalized invite links from the Friends tab with 1-click **Copy Link**, **WhatsApp**, and **iMessage/SMS** sharing. When a friend opens the link, the app automatically creates a reciprocal two-way friendship in Supabase (`addLiveFriendship`), adding the friend to your circle and adding you to their circle simultaneously.
- **Project-Wide Storage & Cookie Preferences (`CookieConsentModal`)**: Configured modal and banner to manage local storage keys (`cinecircle_auth_session`, `cinecircle_streaming_country`, `avatar_character_id`, `cinecircle_cookie_consent`), respecting essential session storage, regional streaming preferences, character avatars, and genre discovery filters.
- **Row Level Security (RLS)**: Enabled across all Postgres tables (`profiles`, `friendships`, `recommendations`, `watchlist`, `recommendation_comments`) with granular security policies preventing unauthorized mutation while allowing circle members to view recommendations.
- **Supabase Comments Thread**: `recommendation_comments` table created in Supabase Postgres with RLS policies enabled. Comments are loaded dynamically and saved directly to the database with realtime live updates.
- **Recommendation Deletion with Confirmation Overlay**: Each feed item features a trash trigger button (🗑️). Clicking it opens a **Delete Recommendation Overlay** modal asking for explicit user confirmation before deletion, which purges the record from both UI state and Supabase.

---

## 👥 Social Circle Architecture: Requests, Audience Privacy & Library Sharing
- **Audience Privacy Segmentation ("All Friends" vs "Global Community" vs "Direct to You")**:
  - **🔒 All Friends (Circle Only)**: Recommendations shared to "All Friends" are strictly private to the user's confirmed inner circle and the sender themselves. They never leak to arbitrary non-friends or unauthenticated visitors.
  - **🌍 Global Community (Public)**: Public community recommendations visible across CineCircle for general discovery.
  - **🎯 Direct to Friend**: High-trust 1-on-1 recommendations targeted exclusively to a specific friend handle.
  - **Guest User Contributions**: Unauthenticated visitors can type a moniker/name and post recommendations directly to the "Global" community feed without needing to create an account first.
- **Friend Request Engine & Handle Validation (`PENDING` -> `ACCEPTED` / Disapprove)**:
  - **Username Validation**: Validates existence against Supabase `profiles` in real time. Returns informative errors if a handle does not exist or if a user attempts to add themselves.
  - **Real Request Flow**: Replaces instant auto-acceptance with an explicit two-way handshake (`status: 'PENDING'`).
  - **Notification Badges & Realtime Requests Queue**:
    - Navbar features a live alert badge (`Friends (! 1)`) indicating pending incoming requests.
    - `FriendsView` features an **Incoming Friend Requests** alert banner displaying the requester's character avatar, display name, handle, with explicit **Approve ✓** (creates reciprocal `ACCEPTED` friendship) and **Disapprove ✕** (rejects and deletes request) buttons.
    - Realtime WebSocket listener (`postgres_changes` on `friendships`) automatically updates friend lists and request queues instantly without requiring page refreshes.
- **Friend Library Inspection & Watchlist Sharing Controls (`FriendLibraryModal`)**:
  - **View Friend Library**: Clicking **"View Library 📚"** on any friend card opens `FriendLibraryModal` showing that friend's saved library (*All Titles*, *Want to Watch*, *Currently Watching*, and *Watched & Rated* with their star scores).
  - **1-Click Library Import**: Allows users to quickly save any film or TV show from their friend's library directly into their own library with 1 click.
  - **Privacy Toggles & Tickmarks**:
    - Global circle switch: *"Allow Circle Friends to View My Library"* (persisted in local settings).
    - Per-friend permission tickmarks on each friend card allowing fine-grained control over which friends can browse your library.
- **Dynamic Media Type Matching (Movie vs TV Series Bug Fix)**:
  - All recommendations dynamically preserve and propagate `media_type` (`"movie" | "tv"`).
  - Resolves TMDB ID collisions between movies and TV series (such as Attack on Titan, TMDB TV ID 1429), ensuring `MovieDetailModal` reliably fetches the correct series synopsis, seasons, and episodes instead of a mismatched film.

---

## 📚 My Library System & 3-Tier Watch Status Tracking
- **"My Library" Primary Tab (`WatchlistView`)**: Evolved the Watchlist view into a full-featured personal media library featuring 5 interactive sub-tabs:
  - 🌟 **All Titles**: Overview of every saved, in-progress, and completed movie or TV series.
  - 📌 **Want to Watch**: Titles queued for upcoming movie nights.
  - 🍿 **Currently Watching**: In-progress TV series and movies with a distinct Amber indicator.
  - ✅ **Watched & Rated**: Completed titles with interactive 1.0–5.0 star user ratings.
  - ✨ **Recommended by You**: Outgoing recommendations you've shared with friends.
- **Interactive Title Expansion & Inline Synopsis Accordion (`WatchlistView`)**:
  - **Dual Expansion Architecture**:
    - **Full Movie Details Modal (`MovieDetailModal`)**: Clicking on any movie title or poster artwork immediately opens the comprehensive Movie Detail modal, presenting high-resolution backdrop art, full TMDB synopsis, release metadata, cast, trailer, direct 3-tier watch status changer, and the **"Recommend This Film to a Friend ✨"** CTA.
    - **Inline Synopsis Accordion ("Synopsis ▾ / Hide ▴")**: Each library card includes an inline synopsis toggle that dynamically fetches and displays the TMDB plot overview right inside the card without navigating away or losing context.
- **Movie Detail Watch Status Tracker (`MovieDetailModal`)**: Replaced binary "Add to Watchlist" button with a 3-tier segmented watch status selector (📌 *Want to Watch*, 🍿 *Watching*, ✅ *Watched* with interactive star rating picker, and ✕ *Remove from Library*). Includes instant state reset upon modal transitions to prevent stale movie data leaks.
- **Interactive Watch Roulette Winner Card (`WatchRouletteModal`)**: Winning film in group watch roulette displays full plot overview with 1-click **"Recommend ✨"** CTA, **"Watch Trailer 🎬"**, and direct title/poster click to open `MovieDetailModal`.
- **Streamlined Movie Card CTA Architecture**: Removed clutter by reserving **"Watch Trailer 🎬"** exclusively for the Movie Detail page. Movie cards across Discover, Feeds, and Group Matcher feature two clear primary actions: **"Recommend ✨"** (opens Recommendation modal) and **"Library 🔖"** (quick save/status toggle).

---

## 🎨 Dynamic Geometric Avvvatars System (`avvvatars-react`)
- **Integration of [Avvvatars](https://github.com/nusu/avvvatars)**: Powered by `avvvatars-react`, providing clean, deterministic, modern geometric SVG avatars derived from seed values across 40 color palettes and 60 algorithmic shapes.
- **Pure Visual Avatars (Zero Fictional Names)**:
  - In avatar selection grids (`AvatarPickerModal`, `AuthModal`, `CompleteProfileModal`, `AccountModal`), avatars are presented purely as visual pictures with no character names, no fictional franchises, and no quotes.
  - Alongside the avatar, the user's `@username` (or display name) is displayed exclusively as the identity.
- **Universal Vector `<UserAvatar />`**: Reusable component rendering high-resolution, vector-crisp SVG shapes across navigation (`Navbar`), friend cards (`FriendsView`), friend library browsing (`FriendLibraryModal`), recommendation feeds (`DiscoverView`, `RecommendationsView`), group matcher selection (`GroupMatcherView`), movie card friend review badges (`MovieCard`), and movie detail review headers (`MovieDetailModal`) without external image network calls or broken URLs.
- **Inline Quick-Pick Carousel**: Embedded directly in `AuthModal` (Sign Up tab) and `AccountModal` (Profile tab), allowing users to immediately see and pick from 10 popular Avvvatar styles in 1 click, alongside a "Browse All" button triggering the full 42-preset `AvatarPickerModal`.
- **Top Tab Switcher in Auth Modal**: Instant toggle tabs (`[Sign In] [Create Account]`) at the top of `AuthModal` so users can switch to the signup view and inspect avatars immediately.
- **Auto-Migration of Legacy Profiles**: Client automatically migrates legacy fictional character profile caches in `localStorage` to modern seeds (`solaris`, `aurora`, `nebula`, `zenith`).
- **Database & Existing Users Migration**: Live Supabase `profiles`, `auth.users`, and `recommendations` migrated to Avvvatar seeds (`solaris`, `aurora`, `nebula`, `zenith`, etc.), seamlessly replacing old movie character identifiers.

---

## 🔒 Unique Handle Enforcer & Google Auth Profile Completion
- **Mandatory Profile Completion (`CompleteProfileModal`)**: When a user logs in via Google Auth or Email, if their profile handle (`@username`) is unconfigured, the app automatically presents a high-focus profile setup modal.
- **Google Metadata Integration**: Automatically pre-fills the user's Full Name from Google Auth (`user_metadata.full_name` / `name`) while prompting them to select a custom `@username` handle, age, and character avatar persona.
- **Real-Time Handle Uniqueness Check (`checkUsernameAvailable`)**: Queries the Supabase `profiles` table in real time with debounced input, displaying instant status (*"✓ Handle Available"* or *"⚠️ Handle Taken"*). Enforced strictly across Sign Up, Google Onboarding, and Account Settings.
- **Zero Fallback Reversion**: Ensures profile details persist directly to Supabase (`profiles`), preventing accounts from ever reverting to `"Guest"` or `"guest"`.

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

## 🏆 Circle Hall of Fame & Taste Compatibility
- **Circle Superlatives & Hall of Fame**: Celebrates friend engagement with dynamic badges:
  - 🏆 *Top Critic*: Friend with highest recommendation velocity.
  - 🍿 *Popcorn Champ*: Friend with most films watched.
  - 🎯 *Genre Guru*: Friend with top expertise across favorite genres.
- **Algorithmic Taste Match %**: Displays mutual affinity scores (`82% - 98%`) on friend cards based on watchlist intersections and shared genre preferences.
- **Taste Compatibility Modal (`TasteCompatibilityModal`)**: Interactive side-by-side comparison displaying shared favorite genres, mutual movie night candidates, and friend's top picks with 1-click recommendation trigger.

---

## 🎛️ Multi-Genre Discovery Studio & Filter Drawer
- **Filter by Genres Trigger Button**: Prominently placed on the **Discover** tab next to Curated Collections, with real-time active filter count indicators.
- **Apple-Style Fluid Spring Transition (`GenreFilterDrawer`)**:
  - Powered by Framer Motion `<AnimatePresence>` for fluid opening and closing transitions.
  - Natural Apple iOS / macOS spring physics (`type: "spring", damping: 32, stiffness: 340, mass: 0.85`), eliminating abrupt unmounting on close.
  - Backdrop dimming with gentle blur and fade transition (`opacity: 0 -> 1` and `1 -> 0`), dismissible by clicking the backdrop or pressing the `Escape` key.
- **Slide-Over Drawer Filter Capabilities**:
  - **Content Format & Media Types**: Filter between 🌟 *All Media*, 🎬 *Feature Movies*, 📺 *TV Series & Shows*, and 📽️ *Documentaries & Docuseries*.
  - **Multi-Select Genre Cloud**: Supports combining arbitrary genres (`🚀 Sci-Fi`, `🔪 Thriller`, `😂 Comedy`, `❤️ Romance`, `⚡ Action`, `👻 Horror`, `🎭 Drama`, etc.) with automatic TV genre ID mapping. TMDB query utilizes pipe delimiters (`|`) for rich OR matching so multi-genre selections return expansive, relevant results.
  - **Quality thresholds**: Any Rating, ★ 7.0+, ★ 7.5+, ★ 8.0+ Masterpieces with calibrated vote thresholds.
  - **Release era selectors**: All Time, 2020s Modern, 2010s, 2000s, 90s Classics.
  - **Sort ordering**: Most Popular, Highest Rated, Latest Releases.
  - **Streaming Provider Filtering**: Includes monetization types (`flatrate|free|ads|rent|buy`) for reliable regional catalog queries.
- **Graceful Empty State & Filter Reset**: When no titles match strict filter criteria, an informative empty state card provides 1-click **"Adjust Filters"** and **"Reset to Top Rated"** CTAs.
- **Active Custom Filter Feedback Banner**: Displays active media format pill, genre tags, and criteria above the discovery grid with 1-click "Adjust Filters" and "Clear" actions.
- **Infinite Pagination**: "Explore More Titles" dynamically fetches subsequent pages from TMDB matching the combined filter parameters.

---

## 🎬 TMDB Algorithmic Recommendations & Live Feed Sharing
- **More Like This Carousel (`MovieDetailModal`)**: Integrated TMDB `/recommendations` API with automatic `/similar` fallback, rendering a horizontal scrolling carousel of related films and series with poster artwork and ratings. Tapping any title immediately loads its details, credits, and streaming availability.
- **Instant Self-Sender Feed Feedback**: When a user shares a recommendation (whether to "All Friends", "Global", or directly to another user), their own recommendation is guaranteed to appear immediately in their Circle and Feeds views without being filtered out.
- **Sensory Alert Confirmation**: Publishing a recommendation triggers an instant confirmation toast alert verifying the recipient and film title.

---

## 🌿 Git Branching & Environment Isolation Architecture
- **Environment Flag Driven**: Codebase is 100% identical between `main` and `staging`. Toggled dynamically via `NEXT_PUBLIC_ENABLE_MOCK_DATA`:
  - **Staging / Dev Mode (`NEXT_PUBLIC_ENABLE_MOCK_DATA="true"`)**: Preloads mock circle members (*alex_films, maya_cine, sam_popcorn*), demo recommendations, and pre-seeded live Supabase test accounts for rapid multi-user validation:
    - **Test User 1**: `tony.stark@avengers.io` | `@ironman` | Password: `password123` (Avatar: *solaris*)
    - **Test User 2**: `alex@avengers.io` | `@alex_films` | Password: `password123` (Avatar: *zenith*)
  - **Production Mode (`NEXT_PUBLIC_ENABLE_MOCK_DATA="false"`)**: Clean state with zero mock data. Real authentication sessions and direct Supabase database querying only.
- **Branching Workflow**:
  - `main`: Production release branch linked to production Vercel deployment (`NEXT_PUBLIC_ENABLE_MOCK_DATA="false"`). Direct commits strictly forbidden.
  - `staging`: Primary integration & testing branch linked to Vercel preview deployment (`NEXT_PUBLIC_ENABLE_MOCK_DATA="true"`).
  - `feat/*`: Feature branches branched from and merged back into `staging`.

---

## 🔗 Deep Linking, URL State Synchronization & Mobile App Shell
- **Bidirectional URL Query Parameter Sync (`?tab=`, `?movie=`, `?type=`)**:
  - **Tab Sync**: Active view state synchronizes seamlessly with URL search parameters (`/?tab=discover`, `/?tab=recommendations`, `/?tab=watchlist`, `/?tab=matcher`, `/?tab=friends`). Browser back/forward buttons, bookmarking, and link sharing maintain user context perfectly.
  - **Movie Deep Links**: Opening any movie detail modal updates the URL query to `/?movie=${id}&type=${movie|tv}`. Closing the modal cleans up the URL without a page reload (`window.history.replaceState`).
  - **Direct Movie Link Sharing**: `MovieDetailModal` includes a **"Copy Direct Movie Link 🔗"** action button that writes the deep link to the user's clipboard, allowing friends to open the exact movie card directly.
- **Mobile Ergonomic Bottom Navigation Bar (`MobileBottomNav`)**:
  - Modern bottom navigation bar docked to the screen bottom for mobile screen widths (`md:hidden`), with safe area padding and frosted backdrop blur (`bg-black/90 backdrop-blur-xl border-t border-[var(--surface-border)]`).
  - Displays high-priority notification badges for incoming friend requests and watchlist counts.
  - Top header on mobile hides redundant horizontally-overflowing tab pills (`hidden md:flex`), delivering a clean, app-like header experience.
- **Realtime Floating In-App Notifications (`ToastNotification`)**:
  - Non-blocking floating toast alerts appear in the top-right corner when new friend recommendations or incoming friend requests arrive via Supabase realtime subscriptions.
  - Features 1-click **"View"** action navigating directly to the relevant tab.

---

## ⭐️ Interactive 0.5-Step Half-Star Rating Picker (`StarRatingPicker`)
- **Granular 1.0–5.0 Star Precision**:
  - Replaced integer-only star rating with an interactive 0.5-step rating picker supporting exact values (1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0).
  - Uses split left/right target hover zones on each star icon for intuitive mouse/touch half-star selection.
  - Includes quick-pick preset chips (`1.0`, `2.0`, `3.0`, `3.5`, `4.0`, `4.5`, `5.0`) for fast mobile ratings.
  - Uniformly implemented across `RecommendModal`, `MovieDetailModal`, and `WatchlistView`.

---

## 🎯 Multi-Friend Consensus Matcher & Enhanced Group Intelligence
- **Multi-Friend Watchlist Intersection**:
  - `GroupMatcherView` dynamically aggregates selected friends' watchlists in parallel (`Promise.all`) via `fetchFriendWatchlist`.
  - Computes exact mathematical intersections between the user's watchlist and all selected friends.
  - Ranks consensus matches by agreement count with celebratory `100% Group Pick` badges and avatar stacks showing exactly which friends want to watch.
  - Intelligent fallback when zero mutual titles exist: recommends the highest-rated titles across the group's collective wishlists.

---

## 🔐 Dedicated Password Recovery Route (`/reset-password`)
- **Standalone Reset Route**: `src/app/reset-password/page.tsx` handles Supabase password recovery callbacks directly.
- **Fragments UI Monochrome Styling**: Matches CineCircle's signature minimalist theme with logo branding, password strength criteria, show/hide password toggles, and direct CTA back to the application.
- **Supabase Auth Event Listener**: Automatically verifies recovery tokens via `onAuthStateChange` (`PASSWORD_RECOVERY`), updating user credentials with `supabase.auth.updateUser({ password })`.

---

## 🔍 Keyboard Accessible Search Autocomplete & Streaming Filters
- **Keyboard Navigation in Autocomplete (`SearchAutocomplete`)**:
  - Supports `ArrowDown` and `ArrowUp` to navigate search suggestions, `Enter` to select, and `Escape` to close suggestions popup.
  - Highlights currently selected autocomplete suggestion with active border and contrast background.
- **Streaming Service Filter Chips (`GenreFilterDrawer`)**:
  - Added dedicated **Streaming Platform** filter section (*Netflix, Amazon Prime Video, Disney+, Apple TV+, Max*).
  - Automatically translates selected services into TMDB watch provider IDs (`with_watch_providers`) scoped to the user's selected country code.
- **Scroll to Top Floating Action (`DiscoverView`)**:
  - Appears smoothly when scrolling down the discovery grid, allowing users to return to top navigation with one tap.

---

## Technical Stack Architecture
- **Frontend**: Next.js 15 (App Router, TypeScript, Tailwind CSS, `@usefragments/ui`, Lucide React icons)
- **Database & Auth**: Supabase (Postgres Database, Row Level Security, Supabase Auth)
- **External Data**: TMDB API v3 (Paginated Search & Discovery, Watch Providers, YouTube Trailers)
- **Analytics & Observability**: `@vercel/analytics` integrated into Root Layout (`<Analytics />`) for privacy-friendly real-time audience metrics.
- **PWA & Mobile App Shell**: Full Progressive Web App support via `/manifest.json`, viewport theme controls (`#000000`), standalone fullscreen display, maskable SVG icons, and interactive `InstallPwaModal` guiding iOS Safari and Android Chrome home screen installation.
