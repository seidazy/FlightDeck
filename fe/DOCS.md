# FlightDeck — Frontend Documentation

## Overview

Real-time flight radar built with React, TypeScript, and Leaflet. Connects to a WebSocket backend and displays planes on an interactive dark-themed map.

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Leaflet + react-leaflet | Map rendering |
| WebSocket (native) | Real-time data from backend |

## Project Structure

```
src/
├── components/
│   ├── DetailPanel.tsx    — flight details panel (route, speed, altitude, etc.)
│   ├── Loader.tsx         — loading spinner overlay
│   ├── Map.tsx            — map container, renders markers, fly-to on select
│   ├── PlaneMarker.tsx    — individual plane marker with rotation & wrapping
│   └── StatusIndicator.tsx— WebSocket connection status (Live/Connecting/Reconnecting)
├── hooks/
│   ├── usePlanesBasic.ts  — WS connection to /ws/planes/basic (all planes)
│   └── usePlaneDetails.ts — WS connection to /ws/planes/details (selected plane)
├── types/
│   └── index.ts           — PlaneBasic, PlaneDetailed types
├── utils/
│   └── geo.ts             — wrapLng(), computeHeading() pure functions
├── App.tsx                — orchestrator (state, heading computation, layout)
├── App.css                — all styles (dark aviation theme)
├── env.d.ts               — Vite environment variable types
├── index.css              — base styles
└── main.tsx               — entry point
```

## Architecture Decisions

### Why "group by type" instead of FSD?

The project has one page, one feature, and ~8 files. FSD would add empty layers without benefit. Group-by-type is the right choice for this scale.

### Why raw Leaflet markers instead of react-leaflet `<Marker>`?

We need imperative control to reposition markers when the user pans across world copies (infinite horizontal scroll). react-leaflet's declarative `<Marker>` doesn't support this.

### Why compute heading on the frontend?

The `/ws/planes/basic` endpoint doesn't include heading. We derive it from position deltas between consecutive WebSocket messages using `atan2(deltaLng, deltaLat)`.

### Why planes don't render until the 2nd WebSocket message?

On the first message there's no previous position to compare, so heading would default to 0° (all planes pointing up). We wait for the second update to have a real heading.

## Features

### Core
- Real-time plane positions on a dark map (CARTO dark tiles)
- Plane icons rotate based on computed heading
- Click a plane → detail panel opens, map flies to it
- Click again or press Escape → deselects

### Detail Panel
- Flight number, airline, status badge (color-coded)
- Route: origin → destination airports
- Data grid: aircraft model, registration, altitude, speed, heading, vertical speed, duration, ETA
- Passenger occupancy bar
- Keyboard accessible (Escape to close, focus trap)

### Resilience
- Auto-reconnect on WebSocket disconnect (2s delay)
- Connection status indicator in header (green/yellow/red)
- Error handling for malformed WebSocket messages (try/catch on JSON.parse)
- Loading spinner until first data arrives

### Map Behavior
- Infinite horizontal scroll (world wraps)
- Planes reposition to the visible world copy on `moveend`
- Vertical bounds constrained (no white gaps)
- Tooltip on hover showing plane ID

## Data Flow

```
Backend WS ──→ usePlanesBasic() ──→ App (state + heading calc) ──→ Map ──→ PlaneMarker
                                                                         ↕
Backend WS ──→ usePlaneDetails() ──→ App ──→ DetailPanel
```

1. `usePlanesBasic` connects to `/ws/planes/basic`, receives all planes every ~1s
2. App computes headings by comparing current vs previous positions
3. Map renders PlaneMarkers only for planes with computed headings
4. On click, `selectedId` is set → `usePlaneDetails` opens a new WS to `/ws/planes/details` and subscribes
5. DetailPanel renders the detailed data

## Environment Variables

```env
VITE_WS_BASE=ws://localhost:4000
```

## Running

```bash
# Requires Node 20+
cd fe
npm install
npm run dev     # http://localhost:5173
npm run build   # production build to dist/
```

## Key Implementation Details

### Longitude Wrapping (`wrapLng`)

```typescript
// Shifts longitude to be within ±180° of a reference point
function wrapLng(lng: number, centerLng: number): number {
  while (lng - centerLng > 180) lng -= 360;
  while (lng - centerLng < -180) lng += 360;
  return lng;
}
```

Used in PlaneMarker to keep markers on the currently visible world copy.

### Heading Computation (`computeHeading`)

```typescript
function computeHeading(prevLat, prevLng, currLat, currLng): number | null {
  const dLat = currLat - prevLat;
  const dLng = currLng - prevLng;
  if (Math.abs(dLat) < 0.0001 && Math.abs(dLng) < 0.0001) return null;
  return (Math.atan2(dLng, dLat) * 180) / Math.PI;
}
```

Returns degrees where 0° = north, 90° = east. Returns null if movement is too small (avoids jitter).

### Stable Click Handler (ref pattern)

```typescript
const onClickRef = useRef(onClick);
onClickRef.current = onClick;
// ...
marker.on("click", () => onClickRef.current());
```

Avoids rebinding the event listener when `onClick` prop changes, while always calling the latest function.
