# Travel Footprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vite-based Leaflet travel footprint page that shows locally defined places on a full-screen map with popups and sensible map behavior for multiple places, a single place, and empty data.

**Architecture:** Replace the placeholder npm init scaffold with a small Vite app. Keep the implementation split into one entry module for bootstrapping the map, one data module for place definitions, and one stylesheet for full-screen layout plus Leaflet display requirements. The map boot flow reads local place data, creates markers with popups, and chooses between fitBounds, single-point focus, or a default empty-state view.

**Tech Stack:** Vite, vanilla JavaScript, Leaflet, npm

---

## File Structure

- Create: `index.html` — Vite HTML entry with full-page app container
- Modify: `package.json` — replace placeholder scripts with Vite scripts and add dependencies
- Create: `src/main.js` — initialize Leaflet map, load tile layer, render places, set initial view
- Create: `src/places.js` — export the local travel place array
- Create: `src/style.css` — full-screen layout and Leaflet-compatible sizing styles

### Task 1: Set up the Vite + Leaflet scaffold

**Files:**
- Modify: `package.json`
- Create: `index.html`

- [ ] **Step 1: Replace `package.json` with Vite scripts and Leaflet dependency**

```json
{
  "name": "leaflet",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "leaflet": "^1.9.4"
  },
  "devDependencies": {
    "vite": "^5.4.10"
  }
}
```

- [ ] **Step 2: Create the Vite HTML entry**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>旅游足迹</title>
  </head>
  <body>
    <div id="map"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 3: Install dependencies**

Run: `npm install`
Expected: install completes successfully and creates `node_modules` plus `package-lock.json`

- [ ] **Step 4: Verify Vite is wired correctly**

Run: `npm run build`
Expected: FAIL with an error like `Could not resolve entry module "src/main.js"` because source files are not created yet

- [ ] **Step 5: Commit scaffold setup**

```bash
git add package.json package-lock.json index.html
git commit -m "chore: bootstrap vite app"
```

### Task 2: Add place data and full-screen map styling

**Files:**
- Create: `src/places.js`
- Create: `src/style.css`

- [ ] **Step 1: Create the local place dataset**

```js
export const places = [
  { name: '北京', lat: 39.9042, lng: 116.4074 },
  { name: '上海', lat: 31.2304, lng: 121.4737 },
  { name: '杭州', lat: 30.2741, lng: 120.1551 }
]
```

- [ ] **Step 2: Create full-screen layout styles**

```css
html,
body {
  margin: 0;
  width: 100%;
  height: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

#map {
  width: 100vw;
  height: 100vh;
}
```

- [ ] **Step 3: Run build to confirm source files are still incomplete**

Run: `npm run build`
Expected: FAIL with an error like `Could not resolve "./main.js"` or `Could not load /src/main.js` because the map entry file still does not exist

- [ ] **Step 4: Commit data and layout files**

```bash
git add src/places.js src/style.css
git commit -m "feat: add travel place data and layout styles"
```

### Task 3: Implement the Leaflet map boot flow

**Files:**
- Create: `src/main.js`
- Modify: `src/style.css`
- Modify: `src/places.js`

- [ ] **Step 1: Create the Leaflet entry implementation**

```js
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './style.css'
import { places } from './places.js'

const defaultCenter = [35.8617, 104.1954]
const defaultZoom = 4
const singlePlaceZoom = 10

const map = L.map('map')

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map)

const latLngs = places.map((place) => {
  const latLng = [place.lat, place.lng]
  L.marker(latLng).addTo(map).bindPopup(place.name)
  return latLng
})

if (latLngs.length > 1) {
  map.fitBounds(latLngs, { padding: [40, 40] })
} else if (latLngs.length === 1) {
  map.setView(latLngs[0], singlePlaceZoom)
} else {
  map.setView(defaultCenter, defaultZoom)
}
```

- [ ] **Step 2: Extend styles so the Leaflet container also inherits full height**

```css
html,
body,
#map {
  margin: 0;
  width: 100%;
  height: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.leaflet-container {
  width: 100%;
  height: 100%;
}
```

- [ ] **Step 3: Ensure the place dataset still matches the expected shape**

```js
export const places = [
  { name: '北京', lat: 39.9042, lng: 116.4074 },
  { name: '上海', lat: 31.2304, lng: 121.4737 },
  { name: '杭州', lat: 30.2741, lng: 120.1551 }
]
```

- [ ] **Step 4: Run production build to verify the app compiles**

Run: `npm run build`
Expected: PASS and output includes `dist/index.html`

- [ ] **Step 5: Commit the map implementation**

```bash
git add src/main.js src/style.css src/places.js
git commit -m "feat: render travel footprint map"
```

### Task 4: Manually verify multi-place, single-place, and empty-state behavior

**Files:**
- Modify: `src/places.js`

- [ ] **Step 1: Start the dev server**

Run: `npm run dev -- --host 127.0.0.1 --port 4173`
Expected: PASS and output includes `http://127.0.0.1:4173/`

- [ ] **Step 2: Verify the multi-place case in the browser**

Open: `http://127.0.0.1:4173/`
Expected:
- a full-screen map is visible
- markers for 北京, 上海, 杭州 are visible after initial load
- clicking each marker opens a popup with the matching place name
- the initial viewport shows all markers without manual panning

- [ ] **Step 3: Change the dataset to a single place**

```js
export const places = [
  { name: '北京', lat: 39.9042, lng: 116.4074 }
]
```

- [ ] **Step 4: Reload and verify the single-place case**

Open: `http://127.0.0.1:4173/`
Expected:
- one marker is visible
- the map is centered on 北京
- the zoom level is tighter than the empty-state default
- clicking the marker opens the popup `北京`

- [ ] **Step 5: Change the dataset to empty**

```js
export const places = []
```

- [ ] **Step 6: Reload and verify the empty-state case**

Open: `http://127.0.0.1:4173/`
Expected:
- the map still renders
- there are no markers
- the viewport uses the configured default center and zoom
- no browser console errors are produced by map initialization

- [ ] **Step 7: Restore the multi-place dataset**

```js
export const places = [
  { name: '北京', lat: 39.9042, lng: 116.4074 },
  { name: '上海', lat: 31.2304, lng: 121.4737 },
  { name: '杭州', lat: 30.2741, lng: 120.1551 }
]
```

- [ ] **Step 8: Run the production build again after restoring the final dataset**

Run: `npm run build`
Expected: PASS and output includes `dist/index.html`

- [ ] **Step 9: Commit the verified final dataset**

```bash
git add src/places.js
git commit -m "test: verify travel footprint map states"
```

## Self-Review

- Spec coverage: the plan covers Vite setup, Leaflet rendering, full-screen layout, local place data, popups, auto-fit for multiple places, single-place focus, and empty-data handling. No spec requirement is uncovered.
- Placeholder scan: no `TBD`, `TODO`, vague testing placeholders, or implicit code steps remain.
- Type consistency: all tasks consistently use `places`, `name`, `lat`, `lng`, `defaultCenter`, `defaultZoom`, and `singlePlaceZoom`.
