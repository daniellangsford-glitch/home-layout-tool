# Home Layout Planner

A local-first interactive tool for planning house layouts, rooms, and backyards. Draw floor plans, place furniture, define zones, and annotate with labels — all stored locally in your browser with no account or internet connection required.

![Home Layout Planner](public/icons.svg)

## Features

- **Multiple plans** — create floor plans, rooms, backyards, garages, or custom layouts
- **Irregular boundaries** — plans support L-shapes, cut-ins, bump-outs, and angled edges via editable polygon points
- **Draw tools** — drag to draw rectangles, circles, zones, and text labels
- **Zones** — named polygon areas (living room, kitchen, garden beds) with colours and opacity
- **Objects** — movable, resizable shapes with labels, colours, opacity, and lock/visibility controls
- **Snap to grid** — per-plan grid with configurable size and opacity; per-object snap override
- **Dimensions** — toggle dimension labels on the boundary, zones, or individual objects
- **Undo / redo** — full history (50 steps) via Ctrl+Z / Ctrl+Y
- **Multi-select** — rubber-band drag selection, Shift+click, bulk delete/duplicate
- **Save presets** — save any shape as a reusable preset
- **Local persistence** — all data stored in IndexedDB via Dexie.js; autosaves on every change
- **Export** — PNG export of the active plan; JSON export/import of the full project

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (bundled with Node.js)

### Install and run

```bash
git clone https://github.com/daniellangsford-glitch/home-layout-tool.git
cd home-layout-tool
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

The output goes to `dist/`. Serve it with any static file server:

```bash
npm run preview        # built-in Vite preview server
npx serve dist         # or any static server
```

### Run tests

```bash
npm test               # run all tests
npm run test:ui        # open the Vitest browser UI
```

## Usage

### Plans
- Click **+ New Plan** in the left sidebar to create a plan
- Set the name, type, dimensions, and unit in **Plan Settings** (right sidebar when nothing is selected)
- Switch between **Top-Down** and **Side View** modes

### Drawing objects
Select a tool from the left sidebar and drag on the canvas:
- **Rectangle / Circle** — creates a shape object
- **Zone** — creates a named polygon area (sits behind objects)
- **Label (T)** — click once to place a text annotation

### Editing shapes
- Click to select; Shift+click to multi-select; drag an empty area for rubber-band selection
- Drag to move; use handles to resize
- Right sidebar shows the inspector for the selected item

### Editing plan boundaries
Click **Edit Layout Shape** in Plan Settings to enter boundary edit mode:
- Drag corner handles to move them
- Click a midpoint dot on an edge to insert a new corner
- Select a corner and click **Remove Corner** to delete it

### Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |
| `Delete` / `Backspace` | Delete selected object(s) or corner |
| `Ctrl+D` | Duplicate selected object(s) |
| `Escape` | Return to Select tool, clear selection |

## Data storage

All data is stored in your browser's IndexedDB — nothing is sent to any server. Export your project as JSON to back it up or share it.

To clear all data: open browser DevTools → Application → IndexedDB → delete the `LayoutAppDB` database.

## Tech stack

| Library | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS v4 | Styling |
| Konva / react-konva | Canvas rendering |
| Zustand | State management |
| Dexie.js | IndexedDB persistence |
| Zod | JSON import validation |

## License

MIT
