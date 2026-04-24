# Travel Footprint V3 Lightbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-screen lightbox overlay that opens from popup thumbnails, shows the clicked image, supports previous/next navigation within the current place, and closes back to the unchanged map state.

**Architecture:** Keep popup HTML generation as the entry point for image clicks, but move lightbox state and DOM handling into a dedicated `src/lightbox.js` module. `src/main.js` will own the wiring between Leaflet popup events and the lightbox API, while `src/style.css` adds overlay styling and `src/lightbox.test.js` covers the lightbox state and DOM behavior with Vitest running in `jsdom`.

**Tech Stack:** Vite, vanilla JavaScript, Leaflet, Vitest, jsdom, npm

---

## File Structure

- Modify: `package.json` — run Vitest in `jsdom` so DOM-based lightbox tests can execute
- Modify: `src/popupContent.js` — render popup thumbnails as clickable buttons with image index metadata
- Modify: `src/popupContent.test.js` — lock in the new popup thumbnail markup
- Create: `src/lightbox.js` — own overlay state, DOM creation, open/close, previous/next navigation
- Create: `src/lightbox.test.js` — cover lightbox state transitions and single-image button visibility
- Modify: `src/main.js` — instantiate the lightbox and connect popup thumbnail clicks to place image arrays
- Modify: `src/style.css` — add full-screen overlay, image viewport, close button, nav buttons, and hidden state styles

### Task 1: Update popup markup for clickable thumbnails

**Files:**
- Modify: `src/popupContent.test.js`
- Modify: `src/popupContent.js`

- [ ] **Step 1: Write the failing popup markup tests for clickable thumbnails**

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
    expect(html).toContain('travel-popup__gallery')
    expect(html).toContain('data-image-index="0"')
    expect(html).toContain('data-image-index="1"')
    expect(html).toContain('travel-popup__thumb-button')
    expect(html).toContain('src="/images/beijing-1.svg"')
    expect(html).toContain('src="/images/beijing-2.svg"')
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
    expect(html).not.toContain('travel-popup__thumb-button')
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

- [ ] **Step 2: Run the popup test file to verify it fails because the thumbnail metadata does not exist yet**

Run: `npm test -- src/popupContent.test.js`
Expected: FAIL with an assertion error showing missing `data-image-index="0"` or `travel-popup__thumb-button`

- [ ] **Step 3: Update the popup HTML generator to render clickable thumbnail buttons**

```js
function renderImageList(images, title) {
  if (!images || images.length === 0) {
    return ''
  }

  const items = images
    .map(
      (image, index) => `
        <button
          type="button"
          class="travel-popup__thumb-button"
          data-image-index="${index}"
          aria-label="查看 ${title} 图片 ${index + 1}"
        >
          <img
            class="travel-popup__image"
            src="${image}"
            alt="${title} 图片 ${index + 1}"
          />
        </button>
      `
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

### Task 2: Add test-first lightbox module coverage

**Files:**
- Modify: `package.json`
- Create: `src/lightbox.test.js`
- Create: `src/lightbox.js`

- [ ] **Step 1: Update the test script so DOM-based tests run in jsdom**

```json
{
  "name": "leaflet",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run --environment jsdom"
  },
  "dependencies": {
    "leaflet": "^1.9.4"
  },
  "devDependencies": {
    "jsdom": "^25.0.1",
    "vite": "^5.4.10",
    "vitest": "^2.1.4"
  }
}
```

- [ ] **Step 2: Install the new test dependency**

Run: `npm install`
Expected: PASS with `jsdom` added to `package-lock.json`

- [ ] **Step 3: Write the failing lightbox tests covering open, navigation, single-image state, and close reset**

```js
import { beforeEach, describe, expect, it } from 'vitest'
import { createLightbox } from './lightbox.js'

describe('createLightbox', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('opens with the clicked image and updates the visible image source', () => {
    const lightbox = createLightbox()

    lightbox.open({
      images: ['/images/beijing-1.svg', '/images/beijing-2.svg'],
      startIndex: 1,
      title: '北京'
    })

    const image = document.querySelector('[data-testid="lightbox-image"]')

    expect(lightbox.getState()).toEqual({
      isOpen: true,
      images: ['/images/beijing-1.svg', '/images/beijing-2.svg'],
      currentIndex: 1,
      title: '北京'
    })
    expect(image?.getAttribute('src')).toBe('/images/beijing-2.svg')
    expect(image?.getAttribute('alt')).toBe('北京 图片 2')
  })

  it('moves backward and forward inside the current place image list', () => {
    const lightbox = createLightbox()

    lightbox.open({
      images: ['/images/beijing-1.svg', '/images/beijing-2.svg', '/images/beijing-3.svg'],
      startIndex: 1,
      title: '北京'
    })

    lightbox.showPrevious()
    expect(lightbox.getState().currentIndex).toBe(0)

    lightbox.showNext()
    lightbox.showNext()
    expect(lightbox.getState().currentIndex).toBe(2)

    const image = document.querySelector('[data-testid="lightbox-image"]')
    expect(image?.getAttribute('src')).toBe('/images/beijing-3.svg')
  })

  it('hides navigation buttons for a single-image place', () => {
    const lightbox = createLightbox()

    lightbox.open({
      images: ['/images/hangzhou-1.svg'],
      startIndex: 0,
      title: '杭州'
    })

    const previousButton = document.querySelector('[data-testid="lightbox-prev"]')
    const nextButton = document.querySelector('[data-testid="lightbox-next"]')

    expect(previousButton?.hasAttribute('hidden')).toBe(true)
    expect(nextButton?.hasAttribute('hidden')).toBe(true)

    lightbox.showNext()
    expect(lightbox.getState().currentIndex).toBe(0)
  })

  it('resets state and hides the overlay when closed', () => {
    const lightbox = createLightbox()

    lightbox.open({
      images: ['/images/shanghai-1.svg', '/images/shanghai-2.svg'],
      startIndex: 0,
      title: '上海'
    })

    lightbox.close()

    const overlay = document.querySelector('[data-testid="lightbox-overlay"]')

    expect(lightbox.getState()).toEqual({
      isOpen: false,
      images: [],
      currentIndex: 0,
      title: ''
    })
    expect(overlay?.getAttribute('aria-hidden')).toBe('true')
    expect(overlay?.hasAttribute('hidden')).toBe(true)
  })
})
```

- [ ] **Step 4: Run the lightbox test file to verify it fails because the module does not exist yet**

Run: `npm test -- src/lightbox.test.js`
Expected: FAIL with an error like `Failed to load url ./lightbox.js`

- [ ] **Step 5: Implement the minimal lightbox module that satisfies the tests**

```js
function clampIndex(index, images) {
  if (images.length === 0) {
    return 0
  }

  return Math.min(Math.max(index, 0), images.length - 1)
}

function createLightboxDom() {
  const overlay = document.createElement('div')
  overlay.className = 'travel-lightbox'
  overlay.hidden = true
  overlay.setAttribute('aria-hidden', 'true')
  overlay.setAttribute('data-testid', 'lightbox-overlay')

  overlay.innerHTML = `
    <div class="travel-lightbox__backdrop" data-lightbox-close="true"></div>
    <div class="travel-lightbox__dialog" role="dialog" aria-modal="true" aria-label="图片预览">
      <button type="button" class="travel-lightbox__close" data-testid="lightbox-close" aria-label="关闭预览">×</button>
      <button type="button" class="travel-lightbox__nav travel-lightbox__nav--prev" data-testid="lightbox-prev" aria-label="上一张">‹</button>
      <figure class="travel-lightbox__figure">
        <img class="travel-lightbox__image" data-testid="lightbox-image" alt="" />
      </figure>
      <button type="button" class="travel-lightbox__nav travel-lightbox__nav--next" data-testid="lightbox-next" aria-label="下一张">›</button>
    </div>
  `

  document.body.append(overlay)

  return {
    overlay,
    image: overlay.querySelector('[data-testid="lightbox-image"]'),
    previousButton: overlay.querySelector('[data-testid="lightbox-prev"]'),
    nextButton: overlay.querySelector('[data-testid="lightbox-next"]'),
    closeButton: overlay.querySelector('[data-testid="lightbox-close"]')
  }
}

export function createLightbox() {
  const elements = createLightboxDom()
  const state = {
    isOpen: false,
    images: [],
    currentIndex: 0,
    title: ''
  }

  function render() {
    const hasImages = state.images.length > 0
    const multipleImages = state.images.length > 1

    if (!state.isOpen || !hasImages) {
      elements.overlay.hidden = true
      elements.overlay.setAttribute('aria-hidden', 'true')
      elements.image.setAttribute('src', '')
      elements.image.setAttribute('alt', '')
      elements.previousButton.hidden = true
      elements.nextButton.hidden = true
      return
    }

    const currentImage = state.images[state.currentIndex]

    elements.overlay.hidden = false
    elements.overlay.setAttribute('aria-hidden', 'false')
    elements.image.setAttribute('src', currentImage)
    elements.image.setAttribute('alt', `${state.title} 图片 ${state.currentIndex + 1}`)
    elements.previousButton.hidden = !multipleImages
    elements.nextButton.hidden = !multipleImages
  }

  function open({ images, startIndex, title }) {
    state.isOpen = true
    state.images = images
    state.currentIndex = clampIndex(startIndex, images)
    state.title = title
    render()
  }

  function close() {
    state.isOpen = false
    state.images = []
    state.currentIndex = 0
    state.title = ''
    render()
  }

  function showPrevious() {
    if (state.images.length <= 1) {
      return
    }

    state.currentIndex = clampIndex(state.currentIndex - 1, state.images)
    render()
  }

  function showNext() {
    if (state.images.length <= 1) {
      return
    }

    state.currentIndex = clampIndex(state.currentIndex + 1, state.images)
    render()
  }

  elements.previousButton.addEventListener('click', showPrevious)
  elements.nextButton.addEventListener('click', showNext)
  elements.closeButton.addEventListener('click', close)
  elements.overlay.addEventListener('click', (event) => {
    const target = event.target
    if (target instanceof HTMLElement && target.dataset.lightboxClose === 'true') {
      close()
    }
  })

  render()

  return {
    open,
    close,
    showPrevious,
    showNext,
    getState() {
      return {
        isOpen: state.isOpen,
        images: [...state.images],
        currentIndex: state.currentIndex,
        title: state.title
      }
    }
  }
}
```

- [ ] **Step 6: Run the lightbox test file to verify it passes**

Run: `npm test -- src/lightbox.test.js`
Expected: PASS with `4 passed`

- [ ] **Step 7: Run the full test suite to verify popup and map tests still pass under jsdom**

Run: `npm test`
Expected: PASS with `3 passed` test files and `10 passed` tests

### Task 3: Wire popup clicks to the lightbox in the map entrypoint

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Add an integration-focused test script for the lightbox module’s public API using the existing lightbox test file**

```js
it('clamps an out-of-range start index to the last available image', () => {
  const lightbox = createLightbox()

  lightbox.open({
    images: ['/images/beijing-1.svg', '/images/beijing-2.svg'],
    startIndex: 9,
    title: '北京'
  })

  expect(lightbox.getState().currentIndex).toBe(1)
})
```

- [ ] **Step 2: Run the lightbox test file to verify the new boundary test passes before wiring the UI**

Run: `npm test -- src/lightbox.test.js`
Expected: PASS with `5 passed`

- [ ] **Step 3: Update the map entrypoint to instantiate the lightbox and connect popup thumbnail clicks**

```js
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './style.css'
import { createLightbox } from './lightbox.js'
import { getInitialMapView } from './mapView.js'
import { renderPopupContent } from './popupContent.js'
import { places } from './places.js'

const map = L.map('map')
const lightbox = createLightbox()

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map)

places.forEach((place) => {
  const latLng = [place.lat, place.lng]
  L.marker(latLng).addTo(map).bindPopup(renderPopupContent(place))
})

map.on('popupopen', (event) => {
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

const initialView = getInitialMapView(places)

if (initialView.mode === 'fitBounds') {
  map.fitBounds(initialView.latLngs, { padding: [40, 40] })
} else {
  map.setView(initialView.center, initialView.zoom)
}
```

- [ ] **Step 4: Run the full test suite to verify the entrypoint wiring did not break existing tests**

Run: `npm test`
Expected: PASS with `3 passed` test files and `11 passed` tests

### Task 4: Style the full-screen lightbox overlay

**Files:**
- Modify: `src/style.css`

- [ ] **Step 1: Add lightbox styles while preserving the existing full-screen map and popup gallery layout**

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

.travel-popup__thumb-button {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  flex: 0 0 auto;
}

.travel-popup__image {
  display: block;
  width: 120px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.travel-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.travel-lightbox__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.82);
}

.travel-lightbox__dialog {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
}

.travel-lightbox__figure {
  margin: 0;
  max-width: min(1100px, calc(100vw - 160px));
  max-height: calc(100vh - 80px);
}

.travel-lightbox__image {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 80px);
  border-radius: 16px;
  object-fit: contain;
  background: #0f172a;
}

.travel-lightbox__close,
.travel-lightbox__nav {
  position: absolute;
  border: 0;
  color: #fff;
  background: rgba(15, 23, 42, 0.72);
  cursor: pointer;
}

.travel-lightbox__close {
  top: 24px;
  right: 24px;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  font-size: 28px;
}

.travel-lightbox__nav {
  top: 50%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  border-radius: 999px;
  font-size: 32px;
}

.travel-lightbox__nav--prev {
  left: 24px;
}

.travel-lightbox__nav--next {
  right: 24px;
}
```

- [ ] **Step 2: Run the production build to verify the new module and styles bundle successfully**

Run: `npm run build`
Expected: PASS with Vite build output ending in `built in`

### Task 5: Manually verify the browser behavior and final regression suite

**Files:**
- Modify: `src/main.js`
- Modify: `src/lightbox.js`
- Modify: `src/style.css`

- [ ] **Step 1: Start the dev server for manual verification**

Run: `npm run dev -- --host 127.0.0.1 --port 4173`
Expected: Vite starts on `http://127.0.0.1:4173/` or the next free port

- [ ] **Step 2: Verify a multi-image place opens the clicked image in the lightbox**

Manual check in browser:
1. Open the map page.
2. Click the 北京 marker.
3. Click the second popup thumbnail.
4. Confirm the full-screen overlay opens.
5. Confirm the large image source is `/images/beijing-2.svg`.

- [ ] **Step 3: Verify previous and next navigation stays inside the current place**

Manual check in browser:
1. While the 北京 lightbox is open, click the previous button.
2. Confirm the large image changes to `/images/beijing-1.svg`.
3. Click the next button.
4. Confirm the large image returns to `/images/beijing-2.svg`.
5. Confirm it never shows Shanghai or Hangzhou images.

- [ ] **Step 4: Verify a single-image place hides navigation controls**

Manual check in browser:
1. Close the lightbox.
2. Click the 杭州 marker.
3. Click its only popup thumbnail.
4. Confirm the overlay opens.
5. Confirm previous and next buttons are not visible.
6. Confirm closing the overlay returns to the current map view.

- [ ] **Step 5: Run the final automated regression suite**

Run: `npm test && npm run build`
Expected: PASS with `3 passed` test files, `11 passed` tests, and a successful Vite production build

- [ ] **Step 6: Commit the lightbox feature**

```bash
git add package.json package-lock.json src/popupContent.js src/popupContent.test.js src/lightbox.js src/lightbox.test.js src/main.js src/style.css
git commit -m "feat: add popup image lightbox"
```
