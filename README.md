# Home Layout Planner

A local-first interactive tool for planning house layouts, rooms, and backyards. Draw floor plans, place furniture, define zones, and annotate with labels — all stored locally with no account or internet connection required.

---

## For end users — getting the app

### Option 1: Desktop installer (recommended)

Download the latest installer from the [Releases page](https://github.com/daniellangsford-glitch/home-layout-tool/releases) and run it. No technical setup required.

| Platform | File |
|---|---|
| Windows | `Home Layout Planner Setup x.x.x.exe` |
| macOS | `Home Layout Planner-x.x.x.dmg` |
| Linux | `Home Layout Planner-x.x.x.AppImage` |

The app installs like any other program and creates a desktop / Start Menu shortcut. All your data is saved locally on your machine.

### Option 2: Run in the browser

If you have Node.js 18+ installed:

```bash
git clone https://github.com/daniellangsford-glitch/home-layout-tool.git
cd home-layout-tool
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

---

## Features

- **Multiple plans** — floor plans, rooms, backyards, garages, or custom layouts
- **Irregular boundaries** — L-shapes, cut-ins, bump-outs, and angled edges via editable polygon corner points
- **Draw tools** — drag to draw rectangles, circles, and zones; click to place text labels
- **Zones** — named polygon areas (living room, kitchen, garden bed) with custom colours and opacity
- **Object list** — left sidebar shows all objects with visibility toggles and quick selection
- **Snap to grid** — configurable grid size and opacity; per-object snap override
- **Dimensions** — toggle measurement labels on the boundary, zones, or individual objects
- **Undo / redo** — full 50-step history (Ctrl+Z / Ctrl+Y)
- **Multi-select** — rubber-band drag, Shift+click, bulk delete/duplicate
- **Saved presets** — save any shape as a reusable preset
- **Local persistence** — autosaves to IndexedDB on every change; no data leaves your machine
- **Export** — PNG of the active plan; JSON export/import of the full project

---

## Usage

### Plans
- Click **+ New Plan** in the left sidebar
- Set name, type, dimensions, and unit in **Plan Settings** (right sidebar, visible when nothing is selected)
- Switch between **Top-Down** and **Side View** modes

### Tools (left sidebar)
| Tool | How to use |
|---|---|
| **Select** | Click to select, Shift+click to add/remove, drag empty area for marquee selection |
| **Rectangle / Circle** | Drag on canvas to draw |
| **Zone** | Drag on canvas to draw a named area |
| **Label (T)** | Click on canvas to place a text annotation |

### Editing
- Drag to move; resize handles appear when selected
- Right sidebar shows the full inspector for the selected item
- **Edit Layout Shape** in Plan Settings → enter boundary edit mode (drag corners, click edges to add corners)

### Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |
| `Delete` / `Backspace` | Delete selected object(s) or corner point |
| `Ctrl+D` | Duplicate selected object(s) |
| `Escape` | Return to Select tool, clear selection |

---

## Building the desktop installer

Requires Node.js 18+ on your own machine. The output can then be sent to anyone — they don't need Node.js installed.

```bash
git clone https://github.com/daniellangsford-glitch/home-layout-tool.git
cd home-layout-tool
npm install
npm run electron:build:win    # → release/Home Layout Planner Setup x.x.x.exe
npm run electron:build:mac    # → release/Home Layout Planner-x.x.x.dmg
npm run electron:build:linux  # → release/Home Layout Planner-x.x.x.AppImage
```

Upload the installer to the [Releases page](https://github.com/daniellangsford-glitch/home-layout-tool/releases) so others can download it directly.

---

## Data storage

All data is stored locally — nothing is ever sent to a server.

**Desktop app:** data is saved in the app's user data folder:
- Windows: `%APPDATA%\home-layout-planner\`
- macOS: `~/Library/Application Support/home-layout-planner/`
- Linux: `~/.config/home-layout-planner/`

**Browser (dev mode):** data is stored in the browser's IndexedDB (`LayoutAppDB`). To clear it: DevTools → Application → IndexedDB → delete `LayoutAppDB`.

Export your project as JSON (**Export JSON** in the header) to back it up or move it between devices.

---

## Tech stack

| Library | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite | Build tool |
| Electron | Desktop app wrapper |
| Tailwind CSS v4 | Styling |
| Konva / react-konva | Canvas rendering |
| Zustand | State management |
| Dexie.js | IndexedDB persistence |
| Zod | JSON import validation |

---

## License

MIT
