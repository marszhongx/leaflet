# Travel Footprint V2 Popup Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the travel footprint map so each place popup can render date, note, and a horizontally scrollable gallery of local images served from `public/`.

**Architecture:** Keep the existing full-screen Leaflet map and map-view logic intact. Expand the place data shape, add a pure popup HTML generator with dedicated tests, and let `src/main.js` bind generated popup markup to markers while `src/style.css` handles popup layout and horizontal image scrolling.

**Tech Stack:** Vite, vanilla JavaScript, Leaflet, Vitest, npm

---

## File Structure

- Create: `public/images/` — local static images referenced by popup content
- Modify: `src/places.js` — expand place data to include `date`, `note`, and `images`
- Create: `src/popupContent.js` — pure popup HTML generator
- Create: `src/popupContent.test.js` — tests for popup HTML generation
- Modify: `src/main.js` — bind popup HTML from the new pure function
- Modify: `src/style.css` — popup text and horizontal gallery styling

### Task 1: Add local popup image assets and expand place data

**Files:**
- Create: `public/images/beijing-1.svg`
- Create: `public/images/beijing-2.svg`
- Create: `public/images/shanghai-1.svg`
- Create: `public/images/shanghai-2.svg`
- Create: `public/images/hangzhou-1.svg`
- Modify: `src/places.js`

- [ ] **Step 1: Create the first Beijing placeholder image**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
  <rect width="320" height="200" fill="#d97706" />
  <text x="160" y="92" text-anchor="middle" font-size="30" fill="#fff">北京</text>
  <text x="160" y="132" text-anchor="middle" font-size="18" fill="#ffedd5">故宫角楼</text>
</svg>
```

- [ ] **Step 2: Create the second Beijing placeholder image**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
  <rect width="320" height="200" fill="#b45309" />
  <text x="160" y="92" text-anchor="middle" font-size="30" fill="#fff">北京</text>
  <text x="160" y="132" text-anchor="middle" font-size="18" fill="#fde68a">景山日落</text>
</svg>
```

- [ ] **Step 3: Create the first Shanghai placeholder image**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
  <rect width="320" height="200" fill="#2563eb" />
  <text x="160" y="92" text-anchor="middle" font-size="30" fill="#fff">上海</text>
  <text x="160" y="132" text-anchor="middle" font-size="18" fill="#dbeafe">外滩夜景</text>
</svg>
```

- [ ] **Step 4: Create the second Shanghai placeholder image**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
  <rect width="320" height="200" fill="#1d4ed8" />
  <text x="160" y="92" text-anchor="middle" font-size="30" fill="#fff">上海</text>
  <text x="160" y="132" text-anchor="middle" font-size="18" fill="#bfdbfe">武康路梧桐</text>
</svg>
```

- [ ] **Step 5: Create the Hangzhou placeholder image**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
  <rect width="320" height="200" fill="#059669" />
  <text x="160" y="92" text-anchor="middle" font-size="30" fill="#fff">杭州</text>
  <text x="160" y="132" text-anchor="middle" font-size="18" fill="#d1fae5">西湖晨雾</text>
</svg>
```

- [ ] **Step 6: Expand the place dataset to the new shape**

```js
export const places = [
  {
    name: '北京',
    lat: 39.9042,
    lng: 116.4074,
    date: '2025-10-01',
    note: '故宫和景山的秋天很好看。',
    images: ['/images/beijing-1.svg', '/images/beijing-2.svg']
  },
  {
    name: '上海',
    lat: 31.2304,
    lng: 121.4737,
    date: '2025-12-18',
    note: '晚上沿着外滩散步，第二天去了武康路。',
    images: ['/images/shanghai-1.svg', '/images/shanghai-2.svg']
  },
  {
    name: '杭州',
    lat: 30.2741,
    lng: 120.1551,
    date: '2026-03-09',
    note: '早起看西湖，游客还不多。',
    images: ['/images/hangzhou-1.svg']
  }
]
```

- [ ] **Step 7: Run the existing map view test suite to verify the data change does not break unrelated behavior**

Run: `npm test -- src/mapView.test.js`
Expected: PASS with `3 passed`

- [ ] **Step 8: Commit the expanded place data and local images**

```bash
git add public/images src/places.js
git commit -m "feat: add local travel popup image assets"
```

### Task 2: Build popup HTML with test-first coverage

**Files:**
- Create: `src/popupContent.test.js`
- Create: `src/popupContent.js`

- [ ] **Step 1: Write the failing popup content tests**

```js
import { describe, expect, it } from 'vitest'
import { renderPopupContent } from './popupContent.js'

describe('renderPopupContent', () => {
  it('renders title, date, note, and all images for a complete place', () => {
    const html = renderPopupContent({
      name: '北京',
      date: '2025-10-01',
      note: '故宫和景山的秋天很好看。',
      images: ['/images/beijing-1.svg', '/images/beijing-2.svg']
    })

    expect(html).toContain('北京')
    expect(html).toContain('2025-10-01')
    expect(html).toContain('故宫和景山的秋天很好看。')
    expect(html).toContain('src="/images/beijing-1.svg"')
    expect(html).toContain('src="/images/beijing-2.svg"')
    expect(html).toContain('travel-popup__gallery')
  })

  it('omits the gallery block when images are empty', () => {
    const html = renderPopupContent({
      name: '上海',
      date: '2025-12-18',
      note: '晚上沿着外滩散步。',
      images: []
    })

    expect(html).toContain('上海')
    expect(html).not.toContain('travel-popup__gallery')
    expect(html).not.toContain('<img')
  })

  it('omits optional blocks when date and note are missing', () => {
    const html = renderPopupContent({
      name: '杭州',
      images: ['/images/hangzhou-1.svg']
    })

    expect(html).toContain('杭州')
    expect(html).not.toContain('travel-popup__meta')
    expect(html).not.toContain('travel-popup__note')
    expect(html).not.toContain('undefined')
  })
})
```

- [ ] **Step 2: Run the popup test file to verify it fails because the implementation does not exist yet**

Run: `npm test -- src/popupContent.test.js`
Expected: FAIL with an error like `Failed to load url ./popupContent.js`

- [ ] **Step 3: Implement the minimal popup HTML generator**

```js
function renderImageList(images, title) {
  if (!images || images.length === 0) {
    return ''
  }

  const items = images
    .map(
      (image, index) =>
        `<img class="travel-popup__image" src="${image}" alt="${title} 图片 ${index + 1}" />`
    )
    .join('')

  return `<div class="travel-popup__gallery">${items}</div>`
}

export function renderPopupContent(place) {
  const title = `<h3 class="travel-popup__title">${place.name}</h3>`
  const date = place.date
    ? `<p class="travel-popup__meta">${place.date}</p>`
    : ''
  const note = place.note
    ? `<p class="travel-popup__note">${place.note}</p>`
    : ''
  const gallery = renderImageList(place.images, place.name)

  return `
    <article class="travel-popup">
      ${title}
      ${date}
      ${note}
      ${gallery}
    </article>
  `.trim()
}
```

- [ ] **Step 4: Run the popup test file to verify it passes**

Run: `npm test -- src/popupContent.test.js`
Expected: PASS with `3 passed`

- [ ] **Step 5: Run the full test suite to verify the new tests and old tests pass together**

Run: `npm test`
Expected: PASS with `2 passed` test files and `6 passed` tests

- [ ] **Step 6: Commit the popup content module and tests**

```bash
git add src/popupContent.js src/popupContent.test.js
git commit -m "feat: add popup content renderer"
```

### Task 3: Wire popup rendering into the map and style the gallery

**Files:**
- Modify: `src/main.js`
- Modify: `src/style.css`
- Modify: `src/places.js`

- [ ] **Step 1: Update the map entrypoint to use the popup renderer**

```js
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './style.css'
import { getInitialMapView } from './mapView.js'
import { renderPopupContent } from './popupContent.js'
import { places } from './places.js'

const map = L.map('map')

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map)

places.forEach((place) => {
  const latLng = [place.lat, place.lng]
  L.marker(latLng).addTo(map).bindPopup(renderPopupContent(place))
})

const initialView = getInitialMapView(places)

if (initialView.mode === 'fitBounds') {
  map.fitBounds(initialView.latLngs, { padding: [40, 40] })
} else {
  map.setView(initialView.center, initialView.zoom)
}
```

- [ ] **Step 2: Add popup content and horizontal gallery styles**

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

.travel-popup {
  width: 220px;
}

.travel-popup__title {
  margin: 0 0 8px;
  font-size: 16px;
}

.travel-popup__meta {
  margin: 0 0 8px;
  color: #475569;
  font-size: 12px;
}

.travel-popup__note {
  margin: 0 0 12px;
  color: #1e293b;
  font-size: 13px;
  line-height: 1.5;
}

.travel-popup__gallery {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.travel-popup__image {
  width: 120px;
  height: 80px;
  flex: 0 0 auto;
  border-radius: 8px;
  object-fit: cover;
}
```

- [ ] **Step 3: Add a place with missing optional fields so the browser flow exercises the empty-block behavior**

```js
export const places = [
  {
    name: '北京',
    lat: 39.9042,
    lng: 116.4074,
    date: '2025-10-01',
    note: '故宫和景山的秋天很好看。',
    images: ['/images/beijing-1.svg', '/images/beijing-2.svg']
  },
  {
    name: '上海',
    lat: 31.2304,
    lng: 121.4737,
    date: '2025-12-18',
    note: '晚上沿着外滩散步，第二天去了武康路。',
    images: ['/images/shanghai-1.svg', '/images/shanghai-2.svg']
  },
  {
    name: '杭州',
    lat: 30.2741,
    lng: 120.1551,
    images: ['/images/hangzhou-1.svg']
  }
]
```

- [ ] **Step 4: Run the full test suite after wiring the popup renderer**

Run: `npm test`
Expected: PASS with `2 passed` test files and `6 passed` tests

- [ ] **Step 5: Run the production build to verify the popup gallery changes compile**

Run: `npm run build`
Expected: PASS and output includes `dist/index.html`

- [ ] **Step 6: Commit the wired popup rendering and styles**

```bash
git add src/main.js src/style.css src/places.js
git commit -m "feat: render popup travel details and gallery"
```

### Task 4: Manually verify popup gallery behavior in the browser

**Files:**
- Modify: `src/places.js`

- [ ] **Step 1: Start the dev server**

Run: `npm run dev -- --host 127.0.0.1 --port 4173`
Expected: PASS and output includes `http://127.0.0.1:4173/`

- [ ] **Step 2: Verify the complete popup content for Beijing**

Open: `http://127.0.0.1:4173/`
Expected:
- clicking the 北京 marker opens a popup
- the popup shows the title `北京`
- the popup shows the date `2025-10-01`
- the popup shows the note `故宫和景山的秋天很好看。`
- the popup shows two image thumbnails loaded from `/images/beijing-1.svg` and `/images/beijing-2.svg`

- [ ] **Step 3: Verify the complete popup content for Shanghai**

Open: `http://127.0.0.1:4173/`
Expected:
- clicking the 上海 marker opens a popup
- the popup shows the title `上海`
- the popup shows the date `2025-12-18`
- the popup shows the note `晚上沿着外滩散步，第二天去了武康路。`
- the popup shows two image thumbnails in a horizontally scrollable row

- [ ] **Step 4: Verify missing optional fields for Hangzhou**

Open: `http://127.0.0.1:4173/`
Expected:
- clicking the 杭州 marker opens a popup
- the popup shows the title `杭州`
- the popup shows one image thumbnail
- the popup does not show `undefined`
- the popup does not show an empty date block or empty note block

- [ ] **Step 5: Run the full test suite one more time after manual verification**

Run: `npm test`
Expected: PASS with `2 passed` test files and `6 passed` tests

- [ ] **Step 6: Run the production build one more time after manual verification**

Run: `npm run build`
Expected: PASS and output includes `dist/index.html`

- [ ] **Step 7: Commit the verified final state**

```bash
git add src/places.js
git commit -m "test: verify popup gallery details"
```

## Self-Review

- Spec coverage: the plan covers expanded place data, `public/` image assets, popup HTML rendering, horizontal gallery styling, optional-field handling, retained map-view behavior, automated popup tests, and browser verification.
- Placeholder scan: no `TBD`, `TODO`, vague directives, or incomplete code steps remain.
- Type consistency: all tasks consistently use the `date`, `note`, `images`, `renderPopupContent`, and `travel-popup__*` naming introduced in earlier steps.
