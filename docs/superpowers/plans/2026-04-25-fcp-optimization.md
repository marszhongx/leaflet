# FCP Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Lighthouse mobile and desktop First Contentful Paint by showing a Leaflet-style map skeleton before loading the real Leaflet app asynchronously.

**Architecture:** `index.html` and `src/style.css` provide the initial paint with an inline SVG skeleton that resembles Leaflet + OSM. `src/main.js` becomes a lightweight async entrypoint that dynamically imports `src/mapApp.js`; `src/mapApp.js` owns all existing Leaflet initialization and marks the page ready after the map is built.

**Tech Stack:** Vite, Leaflet, Vitest with jsdom, vanilla JavaScript/CSS, inline SVG.

---

## File Structure

- Modify `index.html`: add the no-text Leaflet-style inline SVG skeleton inside `#map`.
- Modify `src/style.css`: position the skeleton, make it fill the viewport, and fade it out when the map is ready.
- Modify `src/main.js`: keep only CSS import, dynamic map app import, ready-state application, and delayed Vercel analytics loading.
- Create `src/mapApp.js`: move existing Leaflet setup from `src/main.js` here.
- Modify `src/main.test.js`: assert the entrypoint uses dynamic imports and no static analytics imports.
- Create `src/index.test.js`: assert the HTML includes the skeleton and contains no visible loading text in the skeleton.
- Modify `src/style.test.js`: assert skeleton and ready-state CSS exist.

---

### Task 1: Test the HTML skeleton contract

**Files:**
- Create: `src/index.test.js`
- Read-only reference: `index.html`

- [ ] **Step 1: Write the failing test**

Create `src/index.test.js` with:

```js
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')

describe('index.html', () => {
  it('renders a Leaflet-style map skeleton before JavaScript loads', () => {
    expect(html).toContain('<div id="map">')
    expect(html).toContain('class="map-skeleton"')
    expect(html).toContain('aria-label="地图骨架屏"')
    expect(html).toContain('id="skeletonTileGrid"')
    expect(html).toContain('fill="#2a81cb"')
  })

  it('keeps the skeleton visual-only without loading text', () => {
    expect(html).not.toContain('地图加载中')
    expect(html).not.toContain('旅游足迹')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/index.test.js`

Expected: FAIL because `index.html` does not contain `.map-skeleton` yet.

- [ ] **Step 3: Commit the failing test**

```bash
git add src/index.test.js
git commit -m "test: cover initial map skeleton contract"
```

---

### Task 2: Add the Leaflet-style skeleton to `index.html`

**Files:**
- Modify: `index.html:9-11`
- Test: `src/index.test.js`

- [ ] **Step 1: Replace the `#map` element**

Change `index.html` from:

```html
    <div id="map"></div>
```

to:

```html
    <div id="map">
      <div class="map-skeleton" aria-label="地图骨架屏" role="img">
        <svg class="map-skeleton__svg" viewBox="0 0 980 520" aria-hidden="true" focusable="false">
          <defs>
            <pattern id="skeletonTileGrid" width="196" height="130" patternUnits="userSpaceOnUse">
              <rect width="196" height="130" fill="#e8eadf" />
              <path d="M196 0H0V130" fill="none" stroke="#c9cfc2" stroke-width="1" opacity="0.55" />
            </pattern>
            <filter id="skeletonMarkerShadow" x="-40%" y="-20%" width="180%" height="180%">
              <feDropShadow dx="5" dy="5" stdDeviation="3" flood-color="#000000" flood-opacity="0.28" />
            </filter>
          </defs>
          <rect width="980" height="520" fill="url(#skeletonTileGrid)" />
          <g opacity="0.42">
            <path d="M-20 94C80 62 158 84 250 54C344 24 416 42 512 72C626 108 720 74 1000 44" fill="none" stroke="#b8d5df" stroke-width="32" stroke-linecap="round" />
            <path d="M-12 448C136 410 232 438 360 396C498 350 596 388 712 350C810 318 896 330 1000 304" fill="none" stroke="#b8d5df" stroke-width="28" stroke-linecap="round" />
          </g>
          <g fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M-34 292C86 250 160 276 256 222C354 166 430 188 526 142C644 86 748 118 1010 78" stroke="#ffffff" stroke-width="16" opacity="0.72" />
            <path d="M-34 292C86 250 160 276 256 222C354 166 430 188 526 142C644 86 748 118 1010 78" stroke="#d4c49f" stroke-width="4" opacity="0.6" />
            <path d="M80 552C142 430 198 372 300 330C408 286 444 220 484 116C506 58 548 18 592 -16" stroke="#ffffff" stroke-width="12" opacity="0.72" />
            <path d="M80 552C142 430 198 372 300 330C408 286 444 220 484 116C506 58 548 18 592 -16" stroke="#d4c49f" stroke-width="3" opacity="0.58" />
            <path d="M618 546C612 432 636 350 706 292C772 238 810 174 818 -20" stroke="#ffffff" stroke-width="12" opacity="0.72" />
            <path d="M618 546C612 432 636 350 706 292C772 238 810 174 818 -20" stroke="#d4c49f" stroke-width="3" opacity="0.58" />
            <path d="M-20 162C96 180 178 150 270 168C366 186 432 242 540 244C668 246 758 202 1004 218" stroke="#ffffff" stroke-width="10" opacity="0.65" />
            <path d="M-20 162C96 180 178 150 270 168C366 186 432 242 540 244C668 246 758 202 1004 218" stroke="#cfc4aa" stroke-width="2.5" opacity="0.54" />
            <path d="M130 72L210 136L284 118L366 178L458 160L540 220L610 210" stroke="#ffffff" stroke-width="7" opacity="0.54" />
            <path d="M130 72L210 136L284 118L366 178L458 160L540 220L610 210" stroke="#cfc4aa" stroke-width="2" opacity="0.45" />
            <path d="M708 356L776 316L850 344L930 294" stroke="#ffffff" stroke-width="7" opacity="0.54" />
            <path d="M708 356L776 316L850 344L930 294" stroke="#cfc4aa" stroke-width="2" opacity="0.45" />
          </g>
          <g opacity="0.34" fill="#c9d8bd">
            <path d="M80 330l72 -36l92 24l28 72l-60 46l-96 -18z" />
            <path d="M540 54l92 -34l78 40l-12 74l-112 18z" />
            <path d="M762 388l86 -28l72 50l-44 72l-92 -6z" />
          </g>
          <g filter="url(#skeletonMarkerShadow)">
            <path d="M371 204C371 181 390 162 413 162C436 162 455 181 455 204C455 235 413 278 413 278C413 278 371 235 371 204Z" fill="#2a81cb" stroke="#ffffff" stroke-width="2.5" />
            <circle cx="413" cy="204" r="12" fill="#ffffff" fill-opacity="0.95" />
          </g>
          <g filter="url(#skeletonMarkerShadow)" transform="translate(214 92) scale(.86)">
            <path d="M371 204C371 181 390 162 413 162C436 162 455 181 455 204C455 235 413 278 413 278C413 278 371 235 371 204Z" fill="#2a81cb" stroke="#ffffff" stroke-width="2.5" />
            <circle cx="413" cy="204" r="12" fill="#ffffff" fill-opacity="0.95" />
          </g>
          <g filter="url(#skeletonMarkerShadow)" transform="translate(-166 174) scale(.78)">
            <path d="M371 204C371 181 390 162 413 162C436 162 455 181 455 204C455 235 413 278 413 278C413 278 371 235 371 204Z" fill="#2a81cb" stroke="#ffffff" stroke-width="2.5" />
            <circle cx="413" cy="204" r="12" fill="#ffffff" fill-opacity="0.95" />
          </g>
        </svg>
      </div>
    </div>
```

- [ ] **Step 2: Run skeleton test**

Run: `npm test -- src/index.test.js`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add initial map skeleton markup"
```

---

### Task 3: Test skeleton CSS behavior

**Files:**
- Modify: `src/style.test.js:8-11`
- Read-only reference: `src/style.css`

- [ ] **Step 1: Add failing CSS tests**

Replace `src/style.test.js` with:

```js
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const styleContent = readFileSync(path.join(process.cwd(), 'src/style.css'), 'utf8')

describe('style.css', () => {
  it('uses viewport height for the map container', () => {
    expect(styleContent).toContain('#map {')
    expect(styleContent).toContain('min-height: 100vh;')
  })

  it('positions the skeleton over the map until Leaflet is ready', () => {
    expect(styleContent).toContain('.map-skeleton {')
    expect(styleContent).toContain('position: absolute;')
    expect(styleContent).toContain('inset: 0;')
    expect(styleContent).toContain('pointer-events: none;')
  })

  it('fades the skeleton when the map is ready', () => {
    expect(styleContent).toContain('body.map-ready .map-skeleton {')
    expect(styleContent).toContain('opacity: 0;')
    expect(styleContent).toContain('visibility: hidden;')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/style.test.js`

Expected: FAIL because `.map-skeleton` CSS does not exist yet.

- [ ] **Step 3: Commit the failing test**

```bash
git add src/style.test.js
git commit -m "test: cover map skeleton styles"
```

---

### Task 4: Implement skeleton CSS

**Files:**
- Modify: `src/style.css:8-21`
- Test: `src/style.test.js`

- [ ] **Step 1: Update map container and skeleton styles**

In `src/style.css`, replace:

```css
#map {
  width: 100%;
  height: 100%;
  min-height: 100vh;
}
```

with:

```css
#map {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #e8eadf;
}

.map-skeleton {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 1;
  visibility: visible;
  transition:
    opacity 220ms ease,
    visibility 220ms ease;
}

.map-skeleton__svg {
  display: block;
  width: 100%;
  height: 100%;
}

body.map-ready .map-skeleton {
  opacity: 0;
  visibility: hidden;
}
```

Keep the existing `.leaflet-container` rule as-is.

- [ ] **Step 2: Run CSS tests**

Run: `npm test -- src/style.test.js`

Expected: PASS.

- [ ] **Step 3: Run skeleton HTML test**

Run: `npm test -- src/index.test.js`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/style.css
git commit -m "feat: style initial map skeleton"
```

---

### Task 5: Test the lightweight entrypoint contract

**Files:**
- Modify: `src/main.test.js:5-13`
- Read-only reference: `src/main.js`

- [ ] **Step 1: Replace the entrypoint test**

Replace `src/main.test.js` with:

```js
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(resolve(process.cwd(), 'src/main.js'), 'utf8')

describe('main entrypoint', () => {
  it('loads the map app asynchronously', () => {
    expect(source).toContain("import('./mapApp.js')")
    expect(source).not.toContain("import L from 'leaflet'")
    expect(source).not.toContain("import 'leaflet/dist/leaflet.css'")
  })

  it('loads Vercel Analytics and Speed Insights dynamically', () => {
    expect(source).toContain("import('@vercel/analytics')")
    expect(source).toContain("import('@vercel/speed-insights')")
    expect(source).not.toContain("import { inject } from '@vercel/analytics'")
    expect(source).not.toContain("import { injectSpeedInsights } from '@vercel/speed-insights'")
  })

  it('marks the page ready after the map app starts', () => {
    expect(source).toContain("document.body.classList.add('map-ready')")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/main.test.js`

Expected: FAIL because `src/main.js` still statically imports Leaflet and analytics.

- [ ] **Step 3: Commit the failing test**

```bash
git add src/main.test.js
git commit -m "test: cover async main entrypoint"
```

---

### Task 6: Move Leaflet setup into `src/mapApp.js`

**Files:**
- Create: `src/mapApp.js`
- Modify later: `src/main.js`
- Reference: `src/main.js:1-67`

- [ ] **Step 1: Create `src/mapApp.js` with existing map logic**

Create `src/mapApp.js` with:

```js
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createLightbox } from './lightbox.js'
import { getInitialMapView } from './mapView.js'
import { markerIconOptions } from './markerIconOptions.js'
import { renderPopupContent } from './popupContent.js'
import { places } from './places.js'
import { tileLayerOptions, tileLayerUrlTemplate } from './tileLayerOptions.js'

export function startMapApp() {
  const markerIcon = L.icon(markerIconOptions)
  const map = L.map('map')
  const lightbox = createLightbox()

  L.tileLayer(tileLayerUrlTemplate, tileLayerOptions).addTo(map)

  places.forEach((place) => {
    const latLng = [place.lat, place.lng]
    const marker = L.marker(latLng, { icon: markerIcon }).addTo(map).bindPopup(renderPopupContent(place))

    marker.on('popupopen', (event) => {
      const popupElement = event.popup.getElement()

      if (!popupElement) {
        return
      }

      popupElement.addEventListener('click', (clickEvent) => {
        const target = clickEvent.target

        if (!(target instanceof HTMLElement)) {
          return
        }

        const trigger = target.closest('[data-image-index]')

        if (!(trigger instanceof HTMLElement)) {
          return
        }

        const imageIndex = Number.parseInt(trigger.dataset.imageIndex ?? '', 10)

        if (Number.isNaN(imageIndex)) {
          return
        }

        lightbox.open({
          images: place.images ?? [],
          startIndex: imageIndex,
          title: place.name
        })
      })
    })
  })

  const initialView = getInitialMapView(places)

  if (initialView.mode === 'fitBounds') {
    map.fitBounds(initialView.latLngs, initialView.options)
  } else {
    map.setView(initialView.center, initialView.zoom)
  }

  return map
}
```

- [ ] **Step 2: Run existing focused tests**

Run: `npm test -- src/mapView.test.js src/popupContent.test.js src/lightbox.test.js src/markerIconOptions.test.js src/tileLayerOptions.test.js`

Expected: PASS. Creating `mapApp.js` should not affect these modules.

- [ ] **Step 3: Commit**

```bash
git add src/mapApp.js
git commit -m "feat: extract Leaflet map app startup"
```

---

### Task 7: Make `src/main.js` lightweight and async

**Files:**
- Modify: `src/main.js:1-67`
- Test: `src/main.test.js`

- [ ] **Step 1: Replace `src/main.js`**

Replace the entire file with:

```js
import './style.css'

async function startApp() {
  const { startMapApp } = await import('./mapApp.js')

  startMapApp()
  document.body.classList.add('map-ready')
  loadInsights()
}

function loadInsights() {
  const load = () => {
    Promise.all([
      import('@vercel/analytics'),
      import('@vercel/speed-insights')
    ]).then(([analytics, speedInsights]) => {
      analytics.inject()
      speedInsights.injectSpeedInsights()
    })
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(load)
    return
  }

  window.setTimeout(load, 0)
}

startApp().catch((error) => {
  console.error(error)
})
```

- [ ] **Step 2: Run entrypoint test**

Run: `npm test -- src/main.test.js`

Expected: PASS.

- [ ] **Step 3: Run all unit tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/main.js
git commit -m "feat: load map app asynchronously"
```

---

### Task 8: Verify production build and generated chunks

**Files:**
- No code changes expected

- [ ] **Step 1: Build the app**

Run: `npm run build`

Expected: PASS. Vite should produce a production bundle in `dist/`.

- [ ] **Step 2: Inspect build output for separate chunks**

Run: `npm run build`

Expected: output includes generated assets. The exact filenames are hashed, but the build should complete without warnings that block output.

- [ ] **Step 3: Commit only if a code change was needed**

If no code changed during this task, do not commit.

---

### Task 9: Browser verification

**Files:**
- No code changes expected unless browser testing reveals a bug

- [ ] **Step 1: Start local server**

Run: `npm run dev -- --host 127.0.0.1 --port 4173`

Expected: Vite reports a local URL at `http://127.0.0.1:4173/`.

- [ ] **Step 2: Open the app in Chrome**

Open: `http://127.0.0.1:4173/`

Expected before Leaflet finishes loading: the viewport shows the no-text Leaflet-style skeleton.

Expected after Leaflet finishes loading: the real map replaces the skeleton and the skeleton fades out.

- [ ] **Step 3: Verify marker and popup behavior**

Click any marker.

Expected: popup opens with the place title and image thumbnails when the place has images.

- [ ] **Step 4: Verify lightbox behavior**

Click a popup thumbnail.

Expected: image lightbox opens. Close button hides it. Previous/next buttons work when multiple images exist.

- [ ] **Step 5: Run Lighthouse mobile and desktop**

In Chrome DevTools Lighthouse, run both Mobile and Desktop against `http://127.0.0.1:4173/`.

Expected: report shows measurable FCP with the skeleton as the first contentful paint. Record the before/after FCP values in the final response if a before value is available from earlier runs; otherwise report the new mobile and desktop FCP values only.

- [ ] **Step 6: Stop local server**

Stop the dev server process started in Step 1.

---

## Self-Review

- Spec coverage: Tasks 1-4 implement and test the no-text Leaflet-style skeleton. Tasks 5-7 implement async map and analytics loading. Tasks 8-9 cover build and browser/Lighthouse validation.
- Placeholder scan: No placeholder steps remain; every code-changing step includes exact code.
- Type consistency: `startMapApp()` is defined in `src/mapApp.js` and imported by `src/main.js`; `map-ready`, `map-skeleton`, and `map-skeleton__svg` names match across HTML, CSS, and tests.
