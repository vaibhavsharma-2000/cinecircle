# CineCircle Design System — Minimalist Black & White (Fragments UI)

## 1. Aesthetic Intent & Color Philosophy
- **Component Engine**: 100% Authentic Fragments UI (`@usefragments/ui` v1.6.0) built on accessible Base UI primitives.
- **Visual Direction**: Ultra-minimalist, stark monochrome Black & White aesthetic. Seamless white-on-white in Light Mode and pure pitch black in Dark Mode.

---

## 2. Minimalist Monochrome Color Tokens

### 🌙 Dark Mode — Pure Pitch Black & Stark White
- **Canvas / Background**: `#000000` (Pure Pitch Black)
- **Card Surface**: `#111113` (Dark Charcoal)
- **Hover Surface**: `#1a1a1e` (Elevated Surface)
- **Borders**: `#26262c` (Subtle Zinc Border)
- **Primary Brand Accent**: `#ffffff` (Pure White Button / Text)
- **Star Rating Accent**: `#f59e0b` (Gold Star Rating)
- **Text Tokens**:
  - Primary: `#ffffff` (Stark White)
  - Secondary: `#a1a1aa` (Neutral Silver)

### ☀️ Light Mode — Seamless Snow White Canvas & White Cards
- **Canvas / Background**: `#ffffff` (Pure Snow White Site Canvas)
- **Card Surface**: `#ffffff` (Seamless White Card Surface)
- **Hover Surface**: `#f4f4f5` (Light Neutral Hover)
- **Borders**: `#e4e4e7` (Subtle Light Border)
- **Primary Brand Accent**: `#000000` (Pure Black Button / Text)
- **Star Rating Accent**: `#d97706` (Golden Amber Rating)
- **Text Tokens**:
  - Primary: `#000000` (Stark Black Ink)
  - Secondary: `#52525b` (Charcoal Slate)

---

## 3. Geometry & Component Styling
- **Card Surfaces**: `<Card>` (`rounded-2xl`, monochrome borders, soft shadows).
- **Navigation & Headers**: `<Header>` with `<Button>` pills (`rounded-full`) and `<Avatar>` pills.
- **Form Controls**: `<Input>` and `<Textarea>` (`rounded-xl` with monochrome focus state).
- **Overlays**: Floating `<Dialog>` (`rounded-2xl` with backdrop blur).

> Note: the live tokens in `src/app/globals.css` have drifted from Section 2 (olive/green tints, e.g. light `--bg #E8E9DF`, `--text-muted #5B6753`, `--primary #2E3D28`; dark `--bg #1A2217`, `--primary #A9B887`). Contrast figures below are computed from the live CSS values.

---

## 4. Interaction & Accessibility Rules (Apple HIG via `apple-design` skill)
Reviewed with the [apple-design skill](https://github.com/dickwu/apple-design-skill) (installed locally at `.cursor/skills/apple-design/`, gitignored). CineCircle is a web app / PWA, so HIG principles and foundations apply, plus mobile conventions where the PWA behaves like an app.

- **Text size**: body and labels at least 12px (`text-xs`), form labels and body copy 14px (`text-sm`). 11px is the floor, for tab-bar labels and badges only. Inputs use `text-base sm:text-sm` so iOS Safari doesn't zoom on focus.
- **Touch targets**: at least 44x44px on mobile (`w-11 h-11` / `min-h-11`). Small icons get a larger invisible hit area (e.g. password eye toggles are a `w-12 h-12` button around a 16px icon). Desktop may shrink to 36px via `sm:` variants.
- **Labels**: every icon-only button has an `aria-label`; toggles use `aria-pressed`; tab switchers use `role="tablist"`/`role="tab"` + `aria-selected`; avatar quick picks are a `radiogroup`.
- **Modals** (`src/lib/useDialog.ts`): one task per modal, `role="dialog"` + `aria-modal` + `aria-labelledby`, focus moves to the first field on open, Tab is trapped inside, Escape closes, focus returns to the opener. Backdrop clicks never discard a form that has been filled in. On mobile widths auth/profile/account modals are bottom sheets (`items-end`, `rounded-t-3xl`, safe-area bottom padding).
- **Feedback**: field errors appear under the field as people type (password mismatch, username taken/available, via `aria-live`). Buttons show a busy label while working ("Signing In...", "Saving..."). Failures are never reported as success. Undoable removals (Library item, friend) show a toast with **Undo** instead of a confirmation; irreversible actions (account deletion) require typing the username plus a Cancel.
- **Loading**: while the session restores, the navbar shows a neutral placeholder instead of flashing "Sign In"; the reset-password page shows "Checking link..." before the form.
- **Motion**: `prefers-reduced-motion: reduce` disables animations, transitions, and hover scaling globally (`globals.css`).
- **Appearance**: follows the device's `prefers-color-scheme` by default; the navbar toggle is a saved per-browser override.
- **Copy**: title-style capitalization for buttons and titles ("Create Account", "Send Reset Link"). Labels say what happens; confirmations reuse the verb ("Reset link sent"). Errors say what went wrong and how to fix it, without "we", "oops", or raw Supabase messages (mapped in `src/lib/authErrors.ts`). No emoji in interface copy.
- **Contrast (live tokens)**: light `--text-secondary` on surface 5.40:1, on canvas 4.89:1; light success on surface 4.53:1; light danger text on danger-subtle 8.10:1; light primary button text 9.45:1; dark `--text-secondary` on surface 6.12:1; dark primary button text 7.70:1. All meet 4.5:1.
