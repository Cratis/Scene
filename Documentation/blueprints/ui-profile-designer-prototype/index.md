---
title: UI profile designer prototype
description: The interactive prototype and walkthrough that define the UI profile designer's interaction model - click the preview, edit in one inspector - with every region, widget, rule and state, and screenshots of each.
---

This folder holds the **reference design** for the UI profile designer (Studio's UI profile page, and any other host that designs a
[UI profile](../ui-profile-designer-contract.md)). The interaction model in it is the agreed one: implementation issues refer to it, and a
difference between the prototype and a host is a bug in the host unless an issue says otherwise.

| File | What it is |
| --- | --- |
| [`ui-profile-editor.html`](ui-profile-editor.html) | The prototype. One self-contained page, plain JavaScript, no build. Open it in a browser. Every setting lives in one state object; every change goes through one function that records an undo step and re-renders the preview and the inspector. |
| [`UI-Profile-Editor-Walkthrough.pdf`](UI-Profile-Editor-Walkthrough.pdf) | The walkthrough (prototype v4, 17 October 2026): every region, widget and interaction, with a screenshot of each state. |
| [`screenshots/`](screenshots) | Every screenshot of the walkthrough as a separate image, numbered in the order of the walkthrough. Captured from the running prototype at 1440 x 900. |

> The catalog in the prototype is **invented**: the blueprint, package, theme, sample pack and font names, the versions and the "who supplies
> what" table are placeholders. The behavior is the specification; the content is replaced by the real catalog.

## The idea

The old designer asked an author to hold three models at once: a tree on the left that selects what to edit, a properties panel on the
right for the selected node, and a cogwheel on the preview that opened yet another properties sidebar. Nothing linked what was clicked to
what changed.

The prototype replaces them with one idea: **the preview is the navigation**. Point at the thing you want to change and a single scrolling
inspector takes you to its settings. Everything applies live and every change can be undone.

| Before | Now |
| --- | --- |
| A tree on the left selects what to edit | Click the thing in the preview, or use the tabs at the top of the inspector |
| Values on the right for the selected node only | One scrolling inspector with six sections; neighbors are visible |
| A cogwheel on the preview opens a second properties sidebar | No second sidebar. Clicking a region highlights it and scrolls the inspector to it |
| Free text for enumerated values (such as `static`) | Visual pickers: schematics for menu modes, thumbnails for blueprints, swatches for accents |
| Packages as a flat list | An ordered list with reasons, locks, dependencies and a "who supplies a component?" table |
| Problems hidden in a separate tab | A problems chip in the status bar with one-click fixes |

## The editor at a glance

![The editor in its starting state](screenshots/01-editor-at-a-glance.jpg)

| # | Element | What it does |
| --- | --- | --- |
| 1 | Undo / Redo | Steps through every change. Disabled when there is nothing to undo or redo. Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z. |
| 2 | Device toggle | Desktop (1280 x 720) or mobile (390 x 800) preview. The active device is filled. |
| 3 | Size readout | Logical size and size class, for example `1280 x 720 · Regular width, Regular height`. |
| 4 | Starter bar | Shown until a starting point is chosen: *Start from a blueprint*, *Use my own shell*, *Keep the defaults*. |
| 5 | Preview stage | The live application, scaled to fit. Interactive: hover, click, open menus, switch screens. |
| 6 | Section tabs | App, Shell, Look, Menu, Packages, Sample data. They jump to a section and follow the scroll position. |
| 7 | Inspector | One scrolling column with every setting, in the order of the tabs. |
| 8 | Problems chip | Green "No problems", or amber with a count. Click it to open the problems panel. |
| 9 | Status message | What the last change was ("Menu mode: Slim", "Undid: ..."), or a hint. |

The status bar also carries the hint "Click anything in the preview to edit it" at its right end, and the header a saved indicator
(green dot, "All changes saved").

## Preview and inspector are one thing

**Hover** draws a dashed outline and a label tab on the region under the pointer. Nothing changes until a click.

![Hovering the sidebar](screenshots/02-hover-outline.jpg)

**Click** draws a solid outline with a glow and the same label, scrolls the inspector to the matching section, flashes that section
briefly, and underlines the matching tab.

![After clicking Customers in the sidebar](screenshots/03-click-selects-and-scrolls.jpg)

![The inspector at the Menu section after the click](screenshots/04-inspector-menu-section.jpg)

| Click here in the preview | Label | The inspector goes to |
| --- | --- | --- |
| Logo or app name | App name and logo | App |
| Top bar (search, avatar, empty space) | Shell | Shell |
| Sidebar, or the horizontal menu items | Menu | Menu |
| Content card with the table | Sample data | Sample data |
| The "New" button | Look and accent | Look |
| Hamburger button | (no selection) | Only opens or closes the menu in Overlay, Drawer and mobile modes |
| A menu item such as "Customers" | Menu | Menu; the screen title and breadcrumb change to that item |

It works in the other direction too. Scrolling the inspector, or clicking a tab, moves the solid outline in the preview to the region that
section controls. **Packages has no region** in the preview, so the outline disappears there. Scrolling to the very bottom always selects
Sample data.

## The six sections

### Starter bar

![The starter bar](screenshots/05-starter-bar.jpg)

| Button | Result |
| --- | --- |
| Start from a blueprint | Hides the bar, scrolls to Shell and flashes it. The status line says "Choose a blueprint in the Shell section". |
| Use my own shell | Hides the bar, selects "My own shell" and scrolls to Shell, where a package or path field appears. |
| Keep the defaults | Hides the bar and leaves the Cratis Default Blueprint in place. |

Each choice is one undo step, so undoing it brings the bar back. The bar also hides itself the first time a blueprint or an own shell is
chosen directly in the inspector.

### App

![The App section](screenshots/06-app-section.jpg)

- **Name** - text field. The preview, the editor header and the starter bar update as you type. Typing is merged into one undo step.
- **Logo** - segmented control *Initials / Icon / Image*; each shows its own control underneath.
- **Name beside logo** - *Show / Hide*.
- **Target platform** - segmented control. *Web* is selected; *Native (not yet)* is disabled.
- **New screens start from** - dropdown: a blank screen, a list screen, a form screen or a detail screen.
- Every field has one line of help text, written for the person editing rather than the system.

The app name and logo are set **once**, here. Every blueprint draws them in its own way; changing the shell or the menu mode never
changes them, and changing them updates every blueprint at once.

| Logo type | Control | Behavior |
| --- | --- | --- |
| Initials | Text field, up to two characters | Characters on a block in the accent color. Empty uses the first letter of the name; the field's placeholder shows which letter that is. |
| Icon | Grid of eight icons | An icon on the accent block. The chosen icon has a highlighted border. |
| Image | *Choose image...*, *Use sample logo*, *Remove* | Your own image, shown **without** the accent block. PNG, JPG, SVG or WebP up to 400 KB. A thumbnail appears beside the buttons. |

![Initials logo](screenshots/10-logo-initials.jpg)
![Icon logo](screenshots/11-logo-icon.jpg)
![Image logo](screenshots/12-logo-image.jpg)

Where the name and logo appear:

| Menu mode | How it is drawn |
| --- | --- |
| Static, Compact | Logo and name at the top of the sidebar. |
| Slim, Slim+, Reveal (collapsed) | Logo mark only. The name returns when Reveal expands on hover. |
| Horizontal | Logo and name at the left end of the top bar. |
| Overlay, Drawer | In the top bar next to the hamburger, and again in the menu panel when it is open. |
| Mobile preview | In the top bar next to the hamburger, and in the drawer. |

Clicking the logo or name in the preview selects "App name and logo" and scrolls the inspector to App.

![Default blueprint: sidebar header](screenshots/13-logo-default-sidebar.jpg)
![Dashboard: left end of the top bar](screenshots/14-logo-dashboard-topbar.jpg)
![Minimal: mark only in the slim rail](screenshots/15-logo-minimal-slim-rail.jpg)
![Name beside logo set to Hide](screenshots/16-logo-name-hidden.jpg)
![Mobile preview](screenshots/17-logo-mobile.jpg)

A problem the logo can raise: the type is *Image* but no image is chosen. The problems chip warns, the panel offers **Use initials**, and
the preview shows an empty dashed box where the logo should be.

![Logo type is Image and no image is chosen](screenshots/18-problem-logo-image-missing.jpg)

### Shell

![The Shell section](screenshots/07-shell-section.jpg)

- Four cards, each with a small wireframe: *Cratis Default* (sidebar with search and breadcrumbs), *Dashboard* (horizontal navigation),
  *Minimal* (slim icon rail) and *My own shell*. The chosen card has a highlighted border and a check mark.
- Choosing a blueprint swaps the blueprint package in position 1 of Packages **and sets the menu mode to the blueprint's default**: Static,
  Horizontal or Slim. The status line says so.
- **Version** dropdown: follow compatible versions (`^1.0.0`), pin to `1.0.0`, or always the latest. A green "Up to date" chip sits under it.
- A note under the cards says every blueprint draws the name and logo from App, with a link back to it.
- *Copy to my templates and edit...* and *Create new shell...* are placeholders that explain in the status line what they would do.

![Choosing Dashboard](screenshots/08-shell-dashboard-blueprint.jpg)

*My own shell* shows a text field for a package name or path. Until it has a value the problems chip raises a warning.

![My own shell](screenshots/09-shell-own-shell.jpg)

### Look

![The Look section](screenshots/19-look-section.jpg)

| # | Control | Behavior |
| --- | --- | --- |
| 1 | Color scheme (*Light / Dark*) | Switching it picks the matching Scene Default theme if the current theme does not fit. |
| 2 | Theme cards, filtered by scheme | Themes whose package is missing are dimmed with "Needs *package*. Selecting it adds the package." Selecting one adds that package, and what it depends on, to Packages. |
| 3 | Accent colour picker | Drags are merged into one undo step. |
| 4 | Hex field | The placeholder shows the theme default. Three- or six-digit colours only; anything else shows a message and changes nothing. |
| 5 | Seven swatches and *Use theme accent* | One-click accents; the link clears the custom accent. |

A **contrast chip** under the accent shows the ratio against white button text and a grade: AAA, AA, large text only, or fails. It is green,
amber or red. A blank accent means "use the theme's accent"; the accent always shows its contrast with white text.

![Accent changed to teal, in the preview](screenshots/21-accent-teal-preview.jpg)
![Accent changed to teal, in the inspector](screenshots/22-accent-teal-inspector.jpg)
![Color scheme set to Dark](screenshots/27-scheme-dark.jpg)
![Material Night chosen](screenshots/28-theme-material-night.jpg)
![Theme list while Dark is selected](screenshots/29-themes-while-dark.jpg)

**Font and corners:**

![Font and corners](screenshots/20-look-font-and-corners.jpg)

- **Font** dropdown (Inter, IBM Plex Sans, Source Serif 4, System UI in the prototype). A sample line under it is set in the chosen face and
  reads "Orders shipped this week: 1 284", so digits and letters show together.
- **Corners**: *Sharp* (4 px), *Theme default* or *Round* (18 px). It affects buttons, cards, the logo and menu items.

![Source Serif 4](screenshots/23-font-source-serif.jpg)
![IBM Plex Sans](screenshots/24-font-ibm-plex.jpg)
![Corners: Round](screenshots/25-corners-round.jpg)
![Corners: Sharp](screenshots/26-corners-sharp.jpg)

### Menu

![The Menu section](screenshots/31-menu-section.jpg)

Eight cards, each with a small schematic of where the menu sits, and a **menu theme** control (*Light / Dark / Primary*; Primary uses the
accent colour). Overlay, Drawer, Reveal and the mobile view respond to clicks and hover in the preview, so they can be felt rather than
imagined.

| Mode | What you see in the preview |
| --- | --- |
| Static | 240 px sidebar, always visible. The Cratis Default Blueprint uses it. |
| Overlay | Menu hidden. The hamburger slides it over the content with no dimming. |
| Slim | 68 px rail with icons only. The Minimal Blueprint uses it. |
| Slim+ | 92 px rail with an icon and a small label under it. |
| Compact | 190 px sidebar with tighter rows and smaller type. |
| Horizontal | Items sit in the top bar and the sidebar disappears. The Dashboard Blueprint uses it. |
| Reveal | Slim rail that expands to the full menu while you hover it. |
| Drawer | Menu hidden. The hamburger opens it with a dimmed scrim; clicking the scrim closes it. |

![Static](screenshots/32-menu-static.jpg)
![Overlay (closed)](screenshots/33-menu-overlay-closed.jpg)
![Slim](screenshots/34-menu-slim.jpg)
![Slim+](screenshots/35-menu-slim-plus.jpg)
![Compact](screenshots/36-menu-compact.jpg)
![Horizontal](screenshots/37-menu-horizontal.jpg)
![Reveal (not hovered)](screenshots/38-menu-reveal-collapsed.jpg)
![Drawer (closed)](screenshots/39-menu-drawer-closed.jpg)

Interactive states:

![Overlay after clicking the hamburger](screenshots/40-menu-overlay-open.jpg)
![Drawer after clicking the hamburger](screenshots/41-menu-drawer-open.jpg)
![Reveal while hovered](screenshots/42-menu-reveal-hovered.jpg)
![Menu theme: Dark](screenshots/43-menu-theme-dark.jpg)
![Menu theme: Primary](screenshots/44-menu-theme-primary.jpg)

### Packages

Packages supply components, styling, themes and shells. When two packages supply the same component, the one higher in the list wins. This
section makes that order, and the reasons behind it, visible.

![The Packages section](screenshots/45-packages-section.jpg)

- Each card shows its position, name, version (monospace), a kind chip (Blueprint, Components, Styling, Themes) and a **reason line**:
  *Chosen*, *Needed by ...*, *Used by Shell* or *Always last*.
- Up and down arrows change the order. They are greyed at the ends.
- **Remove (x) turns into a lock** when something needs the package. Its tooltip names the reason.
- **Core is always last** and cannot move or be removed.
- *Add a package...* opens an inline list. Each entry says what else it will add (Material Components also adds Tailwind if missing).
  Packages are inserted just above Core.
- A **"Who supplies a component?"** table lists, per component, the winning package and the others that also supply it.

![Add a package](screenshots/46-packages-add-a-package.jpg)
![Who supplies a component?](screenshots/47-packages-supplier-table.jpg)
![Material Themes added by choosing a Material theme](screenshots/30-packages-after-material-night.jpg)

Order changes the result, and you can see it: the caption under the table in the content card always names the package that currently
supplies the data table, so reordering has a visible effect in the preview ("DataTable from PrimeReact").

![Reordering changes the supplier](screenshots/48-packages-reorder-changes-supplier.jpg)

### Sample data

![The Sample data section](screenshots/49-sample-data-section.jpg)

The pack every preview, screen and run uses while you design. The help text says production builds never include sample data. Each card
lists its column names; the chosen card has a check. *Manage packs...* is a placeholder button. Status cells become coloured pills: green for
good states, amber for pending, red for failed or overdue, grey otherwise.

| Pack | Columns |
| --- | --- |
| Generic (typed by field kind), the default | Name, Amount, Date, Status (made up from each field's type) |
| Contoso Retail | SKU, Product, Price, Availability |
| Clinic | Patient, Visit, Date, Status |
| Ledger (NOK) | Invoice, Customer, Amount, Status |

![Contoso Retail](screenshots/50-sample-data-contoso-retail.jpg)
![Clinic](screenshots/51-sample-data-clinic.jpg)
![Ledger](screenshots/52-sample-data-ledger.jpg)
![The full preview with Contoso Retail](screenshots/53-sample-data-full-preview.jpg)

## Problems panel and status bar

![An accent that is too light](screenshots/54-problems-accent-too-light.jpg)

The bottom bar has three parts: the problems chip, the status message and the hint at the right. The chip is green with a check when all is
well, and amber with a count when there are problems. Clicking an amber chip opens a panel above it. Each row has an icon, a title, one
explanatory line and a button that jumps to the right section and applies the fix.

| Problem | When it appears | Fix button |
| --- | --- | --- |
| Theme needs a package | The selected theme comes from a package that is not in the list, for example after removing Material Themes. | Add package |
| Accent too light | Contrast with white button text is below 3:1. | Use theme accent |
| Own shell has no value | "My own shell" is chosen and the path field is empty. | Use default blueprint |
| Logo image missing | Logo type is Image and no image is chosen. | Use initials |
| Reveal needs hover | Information, not an error: the mobile preview is on while the Reveal mode is selected. | Switch to Drawer |

![The status bar in its calm state](screenshots/55-status-bar-calm.jpg)

## Device preview, undo and redo

![Mobile preview](screenshots/56-device-mobile.jpg)
![Mobile with the menu open](screenshots/57-device-mobile-menu-open.jpg)

The mobile preview (390 x 800) turns the menu into a hamburger, hides search and drops the last two table columns. Its menu is a drawer with
a scrim, whatever menu mode is chosen.

![After three menu changes and two undos](screenshots/58-undo-redo.jpg)

- Every change in the inspector is one step with a readable label such as "Menu mode: Slim" or "Added Material Components".
- Typing a name or dragging the colour picker is merged into one step when edits come within about one second of each other.
- Making a new change after undoing clears the redo stack.
- Preview-only actions are **not** in the history: opening a menu, switching screens, switching device, opening the problems panel.
- Ctrl/Cmd+Z undoes, Ctrl/Cmd+Shift+Z redoes. They are ignored while a text field or dropdown has focus so normal text undo still works.

The editor chrome follows the system theme (light or dark). The previewed application has its own scheme, set in Look, and does not follow
the system.

![Studio chrome in light mode](screenshots/59-studio-light-chrome.jpg)

## Widget reference

| Widget | Where | Looks like | Does |
| --- | --- | --- | --- |
| Undo / Redo buttons | Header | Rounded icon buttons, dim when unavailable | Step through the change history |
| Saved indicator | Header | Green dot with "All changes saved" | Shows state |
| Device toggle | Header | Two icon buttons, the active one filled | Desktop 1280 x 720 or mobile 390 x 800 preview |
| Size readout | Header | Monospace text | Logical size and size class |
| Starter bar | Above preview | Panel with one primary and two secondary buttons | Choose how to begin; hides itself afterwards |
| Hover outline | Preview | Dashed outline with a label tab | Previews what a click would select |
| Selection outline | Preview | Solid outline, glow, label tab | Marks the region the active section controls |
| Preview menu items | Preview | Icon and label rows | Change the screen shown; select Menu |
| Hamburger | Preview | Three-line icon in the top bar | Opens and closes Overlay, Drawer and mobile menus |
| Scrim | Preview | Dark layer behind an open drawer | Click to close the menu |
| Section tabs | Inspector | Text tabs, the active one underlined | Jump to a section; follow scroll position |
| Section flash | Inspector | Brief tint on a section | Shows where you landed after a jump |
| Text field | App, Shell, Look | Input with a focus ring | App name, own shell path, accent hex. Commits on Enter or blur |
| Logo type control | App | Segmented: Initials, Icon, Image | Chooses how the logo is made; the controls below change with it |
| Initials field | App | Short text field, two characters | Letters on the accent block; the placeholder shows the fallback letter |
| Icon grid | App | Eight square icon buttons | Picks the logo icon |
| Choose image... / Use sample logo | App | Secondary buttons | Load your own logo (up to 400 KB), or a built-in mark |
| Logo thumbnail and Remove | App | Small framed preview and a link | Shows the loaded image; Remove clears it |
| Name beside logo | App | Segmented: Show, Hide | Shows or hides the name next to the mark |
| Link to App | Shell | Text link in a note | Jumps back to the App section |
| Dropdown | App, Shell, Look | Native select | New screens template, version rule, font |
| Segmented control | App, Look, Menu | Pill group, selected segment raised | Platform, color scheme, corners, menu theme |
| Selection card | Shell, Look, Menu, Data | Bordered card; the selected one has a highlighted border and a check | Blueprint, theme, menu mode, sample pack |
| Dimmed card | Look | Card at reduced opacity with a reason | Theme whose package is missing; choosing it adds the package |
| Wireframe thumbnail | Shell, Look | Small drawing of the layout or theme | Shows the idea before you choose it |
| Menu schematic | Menu | Tiny frame with a bar where the menu sits | Shows each of the eight modes |
| Colour picker | Look | Square swatch button | Any accent colour; updates live |
| Accent swatches | Look | Seven circles; the selected one has a ring | One-click accent |
| "Use theme accent" link | Look | Text link | Clears the custom accent |
| Contrast chip | Look | Pill with a ratio and a grade; green, amber or red | Whether white button text is readable |
| Font sample | Look | One line in the chosen face | Preview of the typeface |
| Version chip | Shell | Green pill "Up to date" | Version status of the blueprint |
| Placeholder buttons | Shell, Data | Secondary buttons with an ellipsis | Show a note in the status line; not built yet |
| Package card | Packages | Number, name, version, kind chip, reason | One entry in the priority list |
| Up / Down / Remove | Packages | Small square icon buttons; a lock replaces the x | Reorder or remove; locked ones explain why |
| Add a package... | Packages | Button that opens an inline list | Add a package with its dependencies |
| Supplier table | Packages | Three-column table | Which package wins each component |
| Problems chip | Status bar | Green check pill or amber warning pill | Opens the problems panel |
| Problems panel | Status bar | Floating list above the chip | Titles, explanations and fix buttons |
| Status message | Status bar | Plain text | Last change, undo or redo note, or hint |

## Rules the prototype enforces

- The app name and logo are set once under App. Every blueprint and menu mode draws them; switching blueprint never changes them.
- Initials are limited to two characters; empty falls back to the first letter of the name. Logo images are limited to 400 KB.
- Choosing the Image type without an image raises a problem and shows a dashed empty box.
- The package list always ends with Core, and Core cannot be moved or removed.
- A package that another package needs cannot be removed. The lock explains which one needs it.
- The blueprint package for the current shell cannot be removed while it is the shell.
- Adding a package also adds anything it depends on, and places them just above Core.
- Choosing a blueprint removes the previous blueprint package and sets the menu mode to that blueprint's default.
- Choosing a theme that needs a missing package adds that package. Removing the package later raises a problem instead of silently
  changing the theme.
- Switching color scheme moves to the matching Scene Default theme if the current theme belongs to the other scheme.
- A blank accent means "use the theme's accent". The accent always shows its contrast with white text.
- A hex field accepts three- or six-digit colours; anything else shows a message and changes nothing.
- The preview always shows the active sample pack, and the table caption names the package that supplies the data table.

## Not in the prototype, on purpose

- Cropping or resizing logo images, a favicon or app icon, and separate light and dark logo variants.
- Real package resolution, versions and downloads.
- Per-screen overrides, nested menus, a screen list, fonts you upload yourself.
- The *Copy to my templates*, *Create new shell* and *Manage packs* actions.
- Saving. The "All changes saved" label is static and reloading resets the profile.
- The preview is a stand-in application, not rendered by the real components.

## Open questions from the walkthrough

- Is "click the preview, edit in one inspector" enough, or is a structure tree also wanted later for per-screen settings?
- Should a blueprint own the menu mode, as in the prototype, or only suggest a default the user can keep?
- How prominent should package order be? It is in the main flow now; it could sit behind an advanced section.
- Does a logo need separate light and dark versions, and a mark-only version for slim menus?
- Should the same logo also produce the favicon and the app icon for installs?
- Should the problems chip also block publishing, or stay advisory?
- Where should the choice of design system and fonts live when apps have more than one theme?
