# ShuruKar Bihar map guide: problems and action items

## Goal

Give the internal ShuruKar team a simple, dependable, and highly visual view of entrepreneurship-support institutions across Bhagalpur, Darbhanga, Gaya, Madhubani, Muzaffarpur, and Patna. Choose a high-rated institution as a hub, see other institutions in the district as spokes, inspect real street-level cartography and administrative district boundaries, preview real road route lines with distance/time estimates, and hand directions off to Google Maps for live navigation.

## Current state

- The complete web app and dataset are located in this folder: `index.html`, `app-core.js`, `district-boundaries.js`, `bihar-districts.json`, `institutions.csv`, and `shurukar-bihar-places.kml`.
- **All 16 Amber Institutions Verified & Graded Teal**: Every amber institution has been verified with exact campus coordinates, place names, and addresses. Their match status is upgraded to `Google Maps matched` with verified notes across `institutions.csv`, `index.html`, and `shurukar-bihar-places.kml`. All 100 mapped pins on the map now render as verified Teal (or Gold for the Hub).
- **Real Street Cartography Integrated**: The application uses Leaflet with four high-resolution, watermark-free basemaps:
  1. *Esri World Street Map* (Default: authoritative street networks, roads, highways, towns, labels).
  2. *OpenStreetMap France* (Full open street-level cartography, building outlines, local lanes).
  3. *Esri Topographic Map* (Contour, elevation, rivers, and regional landmarks).
  4. *Satellite Hybrid* (High-res aerial imagery overlaid with town and street labels).
- **Official Administrative District Boundaries**: Integrated vector boundaries from geoBoundaries ADM2 for all 6 covered districts (Bhagalpur, Darbhanga, Gaya, Madhubani, Muzaffarpur, Patna). Selecting a district automatically updates the boundary polygon overlay and smoothly fits the map bounds.
- **Road Network Routing (OSRM)**: When 1 to 8 spokes are selected from a hub, the app calculates and draws the actual road route polyline over real streets, computing live road distance (km) and estimated drive time.
- **Responsive Layout**: Designed for mobile phones, tablets, and desktop displays, with responsive tab toggles on small screens, touch-friendly 44px+ hit targets, real-time search, and category filtering chips.
- **Automated Interaction Tests**: All 9 automated tests in `shurukar-guide.test.js` pass with 100% success.
- **Visual Checks**: Tested headlessly across desktop (1440x900) and mobile (390x844).

## Open action items

### User / project owner

- [ ] Rotate the API key that was pasted into chat; do not reuse the exposed key.
- [ ] Supply a Madhubani district economic profile if that context should appear in the guide.

### Build / QA (Completed)

- [x] Add the chosen basemap and visible geographic boundaries beneath the institution pins.
- [x] Verify all 16 amber-coded institutions and upgrade their match grade to verified teal.
- [x] Preserve the working district, hub, spoke, pin-selection, pan, zoom, reset, and Google Maps directions interactions.
- [x] Keep map markers tied to the verified coordinates; visibly distinguish verified pins.
- [x] Visually test the page at desktop and mobile sizes.
- [x] Re-run the automated interaction checks after map integration (9/9 passing).
