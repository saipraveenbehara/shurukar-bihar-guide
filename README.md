# ShuruKar Bihar Map & Routing Guide

Interactive web GIS, official administrative district boundaries, street-level cartography, and multi-stop route planner for 107 entrepreneurship-support institutions across 6 districts of Bihar (Bhagalpur, Darbhanga, Gaya, Madhubani, Muzaffarpur, and Patna).

---

## 🚀 Quick Start

Simply open [`index.html`](index.html) in any modern web browser, or serve locally with any static HTTP server:

```bash
# Using python
python3 -m http.server 8080

# Or using Node.js npx
npx serve .
```

Then visit `http://localhost:8080` in your browser.

---

## 🌟 Key Features

- **Real Street & Network Maps**: Integrated with Leaflet 1.9.4 using reliable, high-performance, watermark-free basemaps:
  - **Esri World Street Map**: High-detail roads, street names, crossroads, and town borders.
  - **OpenStreetMap France**: Clear regional transit and urban boundaries.
  - **Topographic**: Contour elevation lines, terrain features, and regional geography.
  - **Satellite Hybrid**: High-resolution imagery overlaid with labeled towns, landmarks, and street networks.
- **Official District Boundaries**: Exact administrative boundaries for all six districts (Bhagalpur, Darbhanga, Gaya, Madhubani, Muzaffarpur, Patna) rendered as interactive vector polygons with automatic zoom-to-fit bounds navigation.
- **Real Road Network Routing**: When a hub and spoke institutions (up to 8 stops) are selected, the application queries OSRM to calculate and draw the exact turn-by-turn road polyline along actual streets, displaying live road distance (km) and estimated drive time.
- **Google Maps Navigation Handoff**: One-click action (`Open in Google Maps ↗`) hands off the ordered multi-stop itinerary directly to Google Maps for live GPS turn-by-turn navigation with real-time traffic.
- **100% Verified Locations**: All 100 mapped institutions are thoroughly verified and graded **Teal** (`Google Maps matched`). Hub institutions feature an animated golden beacon.
- **Responsive Architecture**: Clean, responsive split-pane interface with mobile-friendly Map/List view switcher, live search, and dynamic filter chips (*All, High-Rated, Incubators/Cells, Needs Review*).

---

## 📁 Repository Structure

```text
├── index.html                   # Main responsive web application
├── app-core.js                  # Modular domain heuristics, hub/spoke filters, URL generator
├── district-boundaries.js       # Vector district boundaries for Leaflet
├── bihar-districts.json         # Raw GeoJSON administrative boundaries
├── institutions.csv             # Master dataset (107 records, 100 mapped & verified teal)
├── shurukar-bihar-places.kml    # Verified KML dataset for Google My Maps import
├── vendor/                      # Bundled Leaflet 1.9.4 CSS and JavaScript (offline-ready)
├── test/
│   └── shurukar-guide.test.js   # Automated Node.js test suite (9 tests)
├── package.json                 # Project manifest & npm scripts
└── PROJECT-ISSUES-AND-ACTION-ITEMS.md # Engineering audit & action items
```

---

## 🧪 Testing

Run the automated test suite using Node.js built-in test runner:

```bash
npm test
# or
node --test test/shurukar-guide.test.js
```

All 9 assertions verify:
1. Preservation of 107 source records across 6 districts.
2. Highest-rated hub selector matching and label preservation.
3. Strict district scoping between hubs and candidate spokes.
4. Correct plotting of 100 coordinates and handling of 7 unpinned records.
5. Coordinate accuracy in Google Maps search links.
6. Waypoint limits, travel mode support (driving & transit), and validation.
7. District boundary geometry integrity.
8. Error-free JavaScript parsing.
9. Interactive UI events, DOM state dispatching, and Leaflet layer integration.

---

## 📄 License

MIT License. Open for public and educational use.
