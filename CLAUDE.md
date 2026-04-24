# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Start dev server on a fixed host/port: `npm run dev -- --host 127.0.0.1 --port 4173`
- Build production bundle: `npm run build`
- Preview built app: `npm run preview`
- Run all tests: `npm test`
- Run a single test file: `npm test -- src/mapView.test.js`

## Architecture

This is a minimal Vite + Leaflet single-page app for showing travel footprint markers on a full-screen map.

### Runtime flow

- `index.html` only provides the map mount point and loads `src/main.js`.
- `src/main.js` is the browser entrypoint. It creates the Leaflet map, loads the OpenStreetMap tile layer, renders markers from local place data, and applies the initial viewport.
- `src/places.js` is the current source of truth for travel locations. Each place uses the shape `{ name, lat, lng }`.
- `src/mapView.js` contains the pure viewport-selection logic. It decides between:
  - `fitBounds` when there are multiple places
  - `setView` with a tighter zoom when there is one place
  - `setView` with a default China-centered viewport when there are no places
- `src/style.css` is responsible for making the map fill the viewport and for ensuring Leaflet containers have usable dimensions.

### Testing strategy

The only automated tests currently target `src/mapView.js` in `src/mapView.test.js`.

That split is intentional: map bootstrapping in `src/main.js` depends on the browser and Leaflet, while the branching logic for choosing the initial view is isolated as a pure function so it can be tested with Vitest.

When changing initial map behavior, update `src/mapView.js` first and keep `src/mapView.test.js` aligned. When changing marker rendering or tile-layer wiring, the primary verification path is still `npm run build` plus browser validation through the dev server.

### Current project scope

This repo does not currently include:

- a backend or persisted data source
- editing UI for places
- route polylines
- a sidebar or list view

The app is intentionally centered on local static data and a full-screen map experience.
