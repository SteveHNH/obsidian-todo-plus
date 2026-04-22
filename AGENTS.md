# AGENTS.md

## Commands

```bash
npm run build       # TypeScript check + esbuild production bundle → main.js
npm run dev         # esbuild watch mode (auto-rebuild on save)
npm test            # Jest unit tests
```

## Architecture

Obsidian plugin using the standard esbuild scaffold. Entry point: `src/main.ts` → bundled to `main.js` (CJS, externals: `obsidian`).

### Data Flow

```
Vault files → TodoIndex (scan/listen) → TodoParser (regex + tag extraction) → TodoItem[]
  → TodoItemView (sidebar, 4 GTD panes) ← user interactions (toggle, open file)
  → TodoIndex.setStatus() → vault file modification → re-index → view update
```

### Key Components

| File | Role |
|------|------|
| `src/main.ts` | Plugin lifecycle, commands, settings wiring |
| `src/model/TodoParser.ts` | **Core logic**: regex-based parser that only captures checkboxes with `#todo/` tags |
| `src/model/TodoIndex.ts` | Vault-wide index: scans all markdown files, listens for create/modify/delete/rename events |
| `src/model/TodoItem.ts` | Data model: status, GTD state, dates, source location |
| `src/model/TodoPlusSettings.ts` | Settings interface and defaults |
| `src/ui/TodoItemView.ts` | Sidebar `ItemView` with 4 tabbed panes (Inbox, Next, Waiting, Someday) |
| `src/ui/SettingsTab.ts` | Plugin settings UI |
| `src/ui/icons.ts` | SVG icon rendering for toolbar |

## Critical Design Decisions

### Tag-Gated Filtering (Core Differentiator)

Checkboxes **without** a `#todo/` tag are completely ignored. This is the key difference from the reference plugin (`larslockefeer/obsidian-plugin-todo`) which pulls in every checkbox. The filtering happens in `TodoParser.parseTasks()` — if the regex matches a checkbox but finds no `#todo/*` tags, it skips that item.

### Tag Schema

| Tag | Purpose |
|-----|---------|
| `#todo/inbox` | GTD: unsorted |
| `#todo/next` | GTD: actionable now |
| `#todo/waiting` | GTD: blocked/deferred |
| `#todo/maybe` or `#todo/someday` | GTD: someday/maybe |
| `#todo/due:YYYY-MM-DD` | Due date |
| `#todo/created:YYYY-MM-DD` | Creation timestamp |
| `#todo/done:YYYY-MM-DD` | Completion timestamp |

The tag prefix (`#todo`) is configurable in settings. If a tagged checkbox has no explicit GTD state tag, it defaults to Inbox.

### Toggle Mechanism

Toggling a todo from the sidebar uses character-level splicing: read the source file, replace `[ ]` ↔ `[x]` at the stored `startIndex`/`length`, write back. This means `startIndex` and `length` must be accurate — they refer to the full checkbox line including the bullet prefix.

## Testing

Tests live in `src/__tests__/`. The parser is the only unit-tested component since it contains the core business logic. The obsidian API is mocked at `src/__mocks__/obsidian.ts`.

## Gotchas

- `esbuild.config.mjs` marks `obsidian` as external — it's provided by the host app at runtime. Never try to bundle it.
- The plugin outputs `main.js` at the repo root (not in a `dist/` folder) — this is required by Obsidian's plugin loader.
- `styles.css` at the repo root is also loaded automatically by Obsidian — don't move it.
- `manifest.json` and `versions.json` at root are required by the Obsidian plugin ecosystem.
- The tsconfig has `noUncheckedIndexedAccess: true` — regex match groups need explicit null handling (e.g., `match[1] ?? ""`).
- `displayDescription` on `TodoItem` strips all `#todo/` tags for clean rendering — it's a computed getter, not stored.
