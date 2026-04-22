# TODO+

GTD-style TODO management for [Obsidian](https://obsidian.md). Unlike other TODO plugins, TODO+ is **tag-gated** — it only collects checkboxes that use `#todo/` tags, leaving your regular checklists untouched.

## Features

- **Tag-gated filtering** — plain checkboxes are ignored; only items with `#todo/` tags appear in the panel
- **5 tabbed panes** — Inbox, Next, Waiting, Someday/Maybe, and a **Done** tab that groups completed items by date
- **Hotkey commands** — quickly insert pre-formatted todos with a single keystroke
- **Live indexing** — changes anywhere in your vault are reflected in the sidebar immediately
- **Due date tracking** — tag items with due dates and see overdue highlighting
- **Click to reveal** — jump to the source file of any todo from the sidebar
- **Complete from sidebar** — check off todos without opening the file
- **Customizable tag prefix** — use `#todo`, `#gtd`, or whatever fits your workflow

## Installation

### From source (manual)

1. Clone or download this repository into your vault's plugin folder:

   ```bash
   cd /path/to/your/vault/.obsidian/plugins
   git clone https://github.com/your-username/obsidian-todo-plus.git
   cd obsidian-todo-plus
   ```

2. Install dependencies and build:

   ```bash
   npm install
   npm run build
   ```

3. In Obsidian, go to **Settings → Community plugins → Installed plugins** and enable **TODO+**.

### Manual install (pre-built)

1. Create a folder at `<your-vault>/.obsidian/plugins/obsidian-todo-plus/`
2. Copy these three files into it:
   - `main.js`
   - `manifest.json`
   - `styles.css`
3. Restart Obsidian and enable **TODO+** in **Settings → Community plugins**.

## Usage

### Writing todos

Add `#todo/` tags to any checkbox item in any note. The tag determines which GTD pane the item appears in:

```markdown
- [ ] Review pull requests #todo/next
- [ ] Research vacation spots #todo/maybe
- [ ] Respond to client email #todo/inbox
- [ ] Waiting on API access from DevOps #todo/waiting
```

Items without a `#todo/` tag are completely ignored — your grocery lists and meeting notes stay out of the sidebar.

### Date tags

Attach dates to your todos using colon syntax:

```markdown
- [ ] Submit tax return #todo/next #todo/due:2025-04-15
- [ ] Weekly review #todo/inbox #todo/created:2025-04-20
```

| Tag | Purpose |
|-----|---------|
| `#todo/due:YYYY-MM-DD` | Due date (shown as a badge, highlighted if overdue) |
| `#todo/created:YYYY-MM-DD` | Creation date |
| `#todo/done:YYYY-MM-DD` | Completion date |

### GTD states

| Tag | Pane | When to use |
|-----|------|-------------|
| `#todo/inbox` | Inbox | Unclarified items — stuff you captured but haven't processed yet |
| `#todo/next` | Next | Actionable items you intend to do soon |
| `#todo/waiting` | Waiting | Items blocked on someone or something else |
| `#todo/maybe` or `#todo/someday` | Someday | Things you might do eventually but not now |

If a checkbox has a `#todo/` tag but no explicit state (e.g., only `#todo/due:2025-05-01`), it defaults to **Inbox**.

### Commands

Open the command palette (`Ctrl/Cmd + P`) and search for "TODO+":

| Command | What it does |
|---------|--------------|
| **Create todo** | Inserts a checkbox with your default GTD state and today's creation date |
| **Create todo (Inbox)** | Inserts with `#todo/inbox` |
| **Create todo (Next)** | Inserts with `#todo/next` |
| **Create todo (Waiting)** | Inserts with `#todo/waiting` |
| **Create todo (Someday/Maybe)** | Inserts with `#todo/maybe` |
| **Show TODO+ panel** | Opens the sidebar panel |

All commands can be bound to custom hotkeys in **Settings → Hotkeys**.

### Completing todos

You can complete a todo in two ways:

1. **From the sidebar** — click the checkbox next to any item. The source file is updated automatically.
2. **In the note** — change `[ ]` to `[x]` as usual. The sidebar updates in real time.

Completed items are removed from their GTD pane and moved to the **Done** tab, where they are grouped by completion date (newest first). Add a `#todo/done:YYYY-MM-DD` tag to track when an item was finished — items without one appear under "No completion date". You can uncheck an item in the Done tab to send it back to its original pane.

### Sidebar

The TODO+ panel opens in the right sidebar by default. It has five tabs across the top — click to switch between GTD panes or view completed items. Each tab shows:

- A checkbox to toggle completion
- The todo description (rendered as markdown)
- A due date badge (color-coded: red = overdue, accent = today, green = future)
- A link icon to jump to the source file

## Settings

Open **Settings → TODO+** to configure:

| Setting | Default | Description |
|---------|---------|-------------|
| Tag prefix | `#todo` | The prefix for all GTD tags. Change to `#gtd`, `#task`, etc. |
| Date format | `yyyy-MM-dd` | Format used for date display |
| Default GTD state | Inbox | The state applied when using the generic "Create todo" command |
| Open files in new leaf | On | Whether clicking "reveal" opens the file in a new pane or replaces the current one |

## Example workflow

A typical GTD processing session with TODO+:

1. **Capture** — throughout the day, use the "Create todo" hotkey to jot items into any note. They land in Inbox automatically.

2. **Clarify** — open the Inbox tab. For each item, decide:
   - Is it actionable now? Change `#todo/inbox` to `#todo/next`
   - Blocked on something? Change to `#todo/waiting`
   - Not now but maybe later? Change to `#todo/maybe`
   - Add a `#todo/due:YYYY-MM-DD` tag if there's a deadline

3. **Execute** — work from the Next tab. Check items off as you complete them. Completed items move to the Done tab automatically.

4. **Review** — periodically scan Waiting, Someday, and Done tabs. Promote items back to Next or Inbox, or revisit what you've accomplished.

## Development

```bash
npm install          # install dependencies
npm run dev          # watch mode (auto-rebuild on file changes)
npm run build        # production build (typecheck + minified bundle)
npm test             # run unit tests
```

## License

[MIT](LICENSE)
