# Adventures of Trishu — Heavy PWA Design Specification

**Date**: 2026-09-04  
**Status**: Approved  
**Author**: Antigravity Pair Programmer  

---

## 1. Overview & Vision

Transform **"Adventures of Trishu"** from a basic browser-playable web game into a first-class, heavy-duty Progressive Web App (PWA). The app must feel indistinguishable from a native mobile application, operate 100% reliably offline without internet connectivity, support seamless installation across Android/Chrome/Edge/Desktop and iOS Safari, and utilize native device capabilities like the Screen Wake Lock API so screens do not dim or sleep during toddler play.

---

## 2. Core Architecture & Requirements

### 2.1 Zero-Dependency Offline Precache Pipeline
- **Build Precache Generator (`scripts/generate-sw.mjs`)**:
  - Automatically triggered post-build (`npm run build`).
  - Scans `dist/assets/`, `dist/index.html`, and `dist/manifest.json`.
  - Injects all generated hashed chunks (`dist/assets/*.js`, `dist/assets/*.css`) into `dist/sw.js` with a unique build cache name (e.g. `trishu-pwa-v3.1.0-<timestamp>`).
- **Development Service Worker (`public/sw.js`)**:
  - Maintained with clean offline fallback so development/preview environments also function.
- **Caching Strategy**:
  - **Hashed Assets (`/assets/*`)**: **Cache-First** (immutable chunks with content hashes).
  - **Navigation (`mode === 'navigate'` / `index.html`)**: **Network-First** with cached `index.html` fallback.
  - **Static & Manifest (`manifest.json`, icons)**: **Stale-While-Revalidate**.
  - **Cache Eviction**: Automatic deletion of legacy cache versions upon `activate`.
  - **Skip Waiting**: Client-driven via `{ type: 'SKIP_WAITING' }` message.

---

## 3. Native Hardware & Device APIs: `PwaManager` (`src/pwa/PwaManager.ts`)

A centralized, singleton TypeScript service managing browser/native capabilities:

1. **Screen Wake Lock API**:
   - Acquires `navigator.wakeLock.request('screen')` during active gameplay.
   - Automatically releases on unmount and re-acquires when document returns to visible state (`visibilitychange` event).
2. **Install Prompt Lifecycle**:
   - Intercepts and captures `beforeinstallprompt` event.
   - Stores prompt reference, notifies subscribers (`onInstallableChange`).
   - `promptInstall()` triggers native prompt and resolves user choice (`accepted` / `dismissed`).
3. **Platform & Standalone Detection**:
   - Detects if running in standalone display mode (`window.matchMedia('(display-mode: standalone)').matches` or iOS `navigator.standalone`).
   - Detects iOS Safari browsers to present specific "Add to Home Screen" instructions.
4. **Network Status Monitor**:
   - Tracks `navigator.onLine` and `online`/`offline` window events.
   - Exposes reactive event subscription for offline indicators.
5. **Service Worker Update Bus**:
   - Listens for new worker installations and transitions to `installed` state while a controller exists.
   - Dispatches update event to trigger reload banner.

---

## 4. Kid-Friendly UI Components

### 4.1 In-App Install Button & Flow (`src/components/PwaInstallModal.tsx` & `src/components/HUD.tsx`)
- Tactile, rounded Trishu-styled "Install App" button in the HUD (top bar) and Menu:
  - Hidden once already installed in standalone mode.
  - Displays download/app icon with bouncy tactile styling.
  - On Chrome/Android/Desktop: Directly triggers native `promptInstall()`.
  - On iOS Safari: Opens a friendly visual modal with step-by-step instructions:
    1. Tap the Share button (⎋ with arrow) in Safari.
    2. Scroll down and tap "Add to Home Screen" (➕).
    3. Tap "Add" in the top right.

### 4.2 Update Banner Toast (`src/components/PwaUpdateToast.tsx`)
- Tactile floating banner when a new version is detected:
  - "🎉 New Update Ready! Tap to refresh Trishu's adventures!"
  - Action button sends `SKIP_WAITING` and reloads window.

### 4.3 Offline Status Pill (`src/components/PwaOfflinePill.tsx`)
- Friendly pill indicator displayed if network drops:
  - "⚡ Playing 100% Offline"
  - Reassures parents and players that all 9 mini-games work without internet.

---

## 5. Web App Manifest & High-Res App Assets

### 5.1 Enhanced `manifest.json` (`public/manifest.json`)
- `name`: "Adventures of Trishu"
- `short_name`: "Trishu"
- `description`: "Joyful 9-game kids mini-game suite featuring Trishu, Leo, Mrs. Clucky, and farm friends!"
- `start_url`: "./"
- `scope`: "./"
- `display`: "standalone"
- `display_override`: ["fullscreen", "standalone", "window-controls-overlay"]
- `orientation`: "any"
- `theme_color`: "#0f172a"
- `background_color`: "#0f172a"
- `categories`: ["games", "kids", "entertainment", "education"]
- `icons`:
  - 192x192 PNG (standard)
  - 512x512 PNG (standard)
  - 192x192 & 512x512 maskable PNGs
  - SVG vector icon
- `shortcuts`:
  - "Happy Mrs. Clucky" -> `#egglaying`
  - "Trishu's Balloon Pop" -> `#balloonpop`
  - "Puddle Splash" -> `#muddypuddles`
  - "Car Wash" -> `#muddycarwash`

### 5.2 Icon Generation Script (`scripts/generate-icons.mjs`)
- Generates crisp high-resolution PNG icons (192x192, 512x512, apple-touch-icon 180x180) from the vector branding, saving to `public/icons/`.

### 5.3 HTML Head & iOS Support (`index.html`)
- `<link rel="apple-touch-icon" href="./icons/icon-192.png">`
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- `<meta name="apple-mobile-web-app-title" content="Trishu">`

---

## 6. Testing & Quality Assurance

1. **Automated Unit & E2E Tests (`tests/pwa.test.ts`)**:
   - Tests `PwaManager` install prompt interception, dismissal, and acceptance.
   - Tests Wake Lock acquisition, release, and visibilitychange recovery.
   - Tests standalone mode detection (Android & iOS).
   - Tests online/offline status event handling.
2. **Build & Precache Verification**:
   - Run `npm run build` and ensure `dist/sw.js` contains all chunks generated in `dist/assets/`.
   - Validate zero CDN dependencies in `manifest.json` and `index.html`.
   - Verify every new/modified file remains under 500 lines of code (Tier 4 quality gate).
