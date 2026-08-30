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
