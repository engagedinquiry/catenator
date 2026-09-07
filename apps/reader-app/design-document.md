# Design document — Catenator Reader

## What this is

A read-only app for browsing pre-authored content that already exists in two folders: `docs/personas/` (persona-specific documentation) and `docs/schema/` (the Catenator standard itself). Nothing is generated, authored, or edited by this app — it only displays what's already written.

## Who it's for

**The reader.** One persona: someone who wants to read Catenator's documentation, shaped for whichever audience they belong to, or read the technical standard directly.

## Layout — non-negotiable, stated once, final

- **One persistent left-hand navigation panel.** Fixed. Full height. Visible in every state. Never at the top. Never at the bottom. Never scrolls out of view.
- **A content pane** to the right of it, showing whatever's currently selected. This pane scrolls independently; the nav panel does not move.

## Navigation

The app offers two ways of navigating pre-authored content, and the mechanism per root is a **config value**, not hardcoded logic tied to a folder name:

- Content in `personas/` is navigable using a **dropdown**, where the folders are the options.
- Content in `schema/` is navigable using an **expandable list (tree)**, based on what's actually in the folder — folder or file.

Folder and file names may be `order-name` (e.g. `2-descriptors`, `3.1-interface`) or plain `name`. **Display strips the order prefix; sorting uses the full name** (numeric order, not alphabetical, where an order prefix exists).

## What's always in the nav panel

Always visible together, in every state:

1. **A Home button** — returns to the site's index page.
2. **A "Reading as" dropdown** — lets the reader pick a persona. Not a list of clickable folders. A dropdown.
3. **A "Schema docs" button.**

## What happens when you use them

- **Selecting a persona from the dropdown** populates that persona's topic list below the dropdown, in the nav panel. Selecting a persona also resets the Schema docs button's active state and hides its tree if it was showing.
- **Clicking "Schema docs"** resets the dropdown to unselected, clears the persona topic list, and shows the schema's own structure in the nav panel instead. Persona topics and schema structure are never shown at the same time — one replaces the other.
- **The home state** (nothing selected yet) shows the actual rendered content of `docs/README.md` in the content pane, with the dropdown unselected and the schema button visible, as always.
- **Active-state indication** — the currently open file, and its containing folder (if any), are visibly shown as selected in the nav panel at all times. This is standard, expected navigation behavior, not an optional extra.

## How deep the content goes — do not assume

Neither `personas/` nor `schema/` has a fixed, known depth. The browsing mechanism must walk the actual folder structure recursively: if an item is a file, it's clickable and shows its content; if an item is a folder, drilling into it repeats the same check. This must work correctly regardless of how many levels deep either folder actually goes, discovered live from what's on disk — never assumed, never hardcoded as "one level" or "two levels."

## Routing — real URLs, simply

Every piece of content should be reachable by a real, bookmarkable URL that matches its folder path directly — e.g. `/personas/engineers/refraction.md`, `/schema/3-views/3.1-interface.md`. Since content is 1:1 with the filesystem and nothing is dynamic, the URL *is* the path. Routing is triggered by clicking the app's own controls (the dropdown, a topic in the list, a schema tree item) — never by parsing or intercepting links rendered inside the markdown content itself.

Kept intentionally simple because this site must keep working even when the files/folders under `assets/` are modified or updated after the app is built.

## Content rendering

Markdown files render with full GitHub Flavored Markdown support, including tables — a pipe-delimited table must become a real HTML `<table>`, not literal pipe characters shown as text.

## Handling the edges of a real site

- **Not-found handling.** If a URL points at a file or folder that doesn't exist (a stale bookmark, a manually edited URL, a file later removed from `assets/`), show a clear "not found" state in the content pane rather than a blank page or a broken app.
- **Loading state.** While a file list or a file's content is being fetched, the content pane shows a simple loading indicator rather than appearing blank or frozen.
- **Page title.** The browser tab title updates per page (e.g. "Refraction — Engineers — Catenator Reader"), not a single static title throughout the app.
- **Empty folder handling.** If a persona or schema folder genuinely contains zero files, the nav panel states this plainly ("No topics yet") rather than showing nothing or erroring.
- **Accessibility.** The dropdown, tree, and navigation links use real semantic HTML elements (not styled `<div>`s standing in for them), so the app is usable via keyboard navigation and screen readers.
- **Mobile / narrow-viewport behavior.** Below a defined width, the fixed left nav panel collapses behind a toggle control rather than permanently occupying screen width or breaking the layout.
- **External links open safely.** Any link inside rendered markdown content that points outside this app (a real external URL, not an internal folder path) opens in a new tab — it never navigates the reader away from their current session.

## What's explicitly out of scope

- No content generation, authoring, or editing of any kind.
- No hardcoded persona names, topic names, filenames, or assumed folder depth anywhere — everything is derived live from the actual files and folders that exist.

## Visual identity

- Styling (colors, icons) matches the look of other Catenator apps — copied as static values/assets from the `syntaxia-studio` reference project, not loaded live from it.
- The app's name and tagline come from a config value, never hardcoded in the UI itself; no prior product name should remain anywhere in the built app.

## Technology

Angular frontend.