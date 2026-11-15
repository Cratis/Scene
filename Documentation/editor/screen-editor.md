---
title: Screen editor
description: How the screen editor is put together, what it asks of its host, how a screen document is opened and handed back, and what each layout type supports.
---

The screen editor is the window that edits one screen of a Scene document, and the same editor set into a page when you author a screen template. This page describes how it works, which layout types it can place, and what its host lends it. It is the reference for anyone extending the editor or hosting it.

## How it fits together

A host opens the editor on a *subject* - a screen of a slice, or a screen template - and the editor hands back a *result* when it closes. In between it works on a Scene document in memory. The board, the page, the routes and the persistence around it belong to the host.

| Piece | Where it lives | What it does |
|---|---|---|
| Frame | `ScreenEditor/Host/ScreenEditorOverlayFrame` | The zoom in and out, the dimmed backdrop, resizing from every edge, and the inspector that slides in beside the window |
| Window, surface, palette, inspector | `ScreenEditor` (`@cratis/scene.editor`) | The title bar controls, the surface that draws the screen, the headed drawers, and the Properties and Structure tabs |
| Host contract | `ScreenEditor/Host/ScreenEditorHost` | `ScreenEditorSubject` (what to open), `ScreenEditorEnvironment` (what the host lends) and `ScreenEditorResult` (what closing hands back) |
| Host | the application that embeds the editor | Lends the editor the application's UI profile, the queries the scope can use, and the state changes a screen can submit, and stores what comes back |

### The editor is lent its model, never reads it

The editor sits outside whatever the host draws behind it. A host draws its own canvas, which may be panned and zoomed with a CSS transform, and that would turn the overlay's fixed positioning into positioning relative to the canvas; so the editor never reaches for a host's providers or stores. `createScreenEditorEnvironment` takes the model it is lent as an argument: the query candidates, the state changes a screen can submit, the destinations a navigation item or button can lead to, the templates the application made itself and the packages in play. A host that does not have the model yet passes `undefined` and the editor does not open against a guess.

### What the editor needs from the page

The editor needs no router, no Arc client and no host provider. It does need the providers the components inside a screen need: Cratis Components' `CratisComponentsProvider` and PrimeReact's `PrimeReactProvider`, because the default palette offers PrimeReact components and those throw without one. The provider must also hand PrimeReact its component styles (`screenEditorPrimeReactDefaults`, which `ScreenEditorPrimeReactProvider` does): PrimeReact 11 components are structure with no look until it does, and the surface would draw the right markup with none of the appearance Play has. PrimeReact 11 also checks a license key and shows an *Invalid PrimeUI License* badge without it; the key belongs to the host's application and is handed to `PrimeReactProvider`, never to the editor.

The editor sits inside an error boundary of its own. A component that fails while drawing a screen closes the editor with a message and leaves the page it was opened over standing, instead of unmounting the whole host.

The chrome never lives inside the designed screen. The inspector, the device buttons, the selection outline, the drop targets and the fading of inherited content are drawn around and over the surface, and none of them is persisted or shown in Play.

## The Scene model

The editor works on a Scene document. It draws it with Scene's own renderer, changes it only by applying Scene edits, and reads what can be changed from Scene's inspection. There is no second model, resolver or edit system to keep in step.

- **Drawing.** The surface renders the composition through `SceneElementView`, resolving component names with the application's UI profile exactly as Play does. Template content is placed ahead of the screen's own content.
- **Editing.** Every change is a `SceneEdit` applied with `applyEdit`: inserting, moving and removing nodes, setting properties, changing a layout type, editing the values a screen gives a template, and exposing properties while authoring a template. The Structure tree, the surface and the keyboard all produce the same edits.
- **Inspecting.** The Properties tab draws what `inspect` reports for the selection: the descriptors say which controls to draw, and the inspection says which may be edited and why not. A property that cannot be edited is shown with the reason.
- **Undo and redo.** The session keeps the document before each applied edit. A refused edit adds nothing to the history, and selection follows an insert only when it went in. Edits are always worked out from the latest session, so two edits in one tick build on each other. History is capped at 100 steps.
- **Who enforces it.** The client uses Scene's `applyEdit` for immediate feedback. On save, a host that keeps the document can validate it with `Cratis.Scene.Engine` (ownership and exposure against the stored document and authoritative template ancestry); the editor stays open with its draft and displays the host's refusal.



## How a screen is opened and handed back

A screen is one Scene document in JSON. The document is the source of truth; the editor reads it from `ScreenEditorSubject` and returns it in `ScreenEditorResult`, and storing it is the host's. Alongside the document the result carries what a host with older readers may still want:

| Member | Holds |
|---|---|
| `document` | The Scene document, with every screen under the name it had |
| `levelOutlets` | How the module and the features the screen sits in refine outlets, when the host keeps them; the document then holds none |
| `legacyElements` | The screen in the prototype element shape that board thumbnails drawn by older readers still use (`projectToLegacyElements`). Hosts without such readers ignore it |
| `windowSize` | The size of the window the screen was designed in |
| `layout` | How the surface arranges its elements (`SurfaceLayout`; the numbers are the ones the earlier prototype layout used) |
| `changed` | Whether anything changed, so a host does not store an untouched screen |

A host that stores documents should check the JSON shape, size and depth, validate inherited content and instance contributions with Scene's document-change validator, resolve template selection from its own application hierarchy and applied UI profile rather than from the submitted document, and refuse a missing or foreign template. The editor stays open with its draft when the host refuses a save.

### Opening a screen

The editor opens screen documents and nothing else. A screen or template with a saved document opens as it is. One with nothing saved opens as a new, empty screen document, at the window size it was last given. The editor has no code that reads a format older than screen documents, shows notes about one, or offers to start again from a preview.

A saved document that cannot be read is never replaced. The editor says why it cannot open the screen and leaves the saved screen as it is until it is repaired. A host that still holds only a drawing made before screen documents existed should keep the editor closed for it - opening an empty screen in its place would save over the drawing - and migrate the data first.

## Window chrome

The window's title bar carries the desktop and mobile buttons, undo and redo, delete, and the inspector toggle. The device buttons only choose a size: the screen is laid out against the window's actual viewport, which is the window minus the title bar. Resizing by hand goes through the same path.

### The window's size

The window opens at the size of the desktop preview, 1280 × 720, plus its title bar, when the page has room for it, and otherwise takes the room there is. The number is chosen for what fits and not for what exists. StatCounter's desktop resolutions for September 2026 lead with 1920×1080 (28%), then 1536×864 (10%), 1366×768 (8%) and 1280×720 (5%); 1280 is the widest layout that opens at full width on every display from 1366 across up, and 720 is the 16:9 height that fits a 1080p page at 100%, where the earlier 1280 × 800 left no room on an 864-high laptop. Design tools land in the same place from the other side: Figma's Desktop frame presets run from the 1280 × 832 MacBook Air through 1440 × 1024 to 1920 × 1080, and 1280 is also Tailwind's `xl` breakpoint. Sources: [StatCounter desktop screen resolution](https://gs.statcounter.com/screen-resolution-stats/desktop/worldwide), [Figma frames](https://help.figma.com/hc/en-us/articles/360041539473-Frames-in-Figma-Design). The value is `viewportPresetSizes[Desktop]`; it is the only place to change it.

Resizing the window by hand is remembered. A size is chosen in this order, and always fitted to the room the page has:

1. The size this person left this screen's window at, on this browser.
2. The size saved with the screen by the host, if it was resized by someone and is not the old 900 × 640 default.
3. The size this person last left any window at, on this browser.
4. The desktop preview.

The first and third are kept in the browser's `localStorage` (`windowSizeMemory`), keyed by slice and role, with the last-used size as the global fallback. They are saved when the window closes, before the screen is saved, so a save that is refused still leaves the window where it was put, and they are read again after a reload. The size is deliberately **not** saved into the screen document. The document's schema has no place for design-time viewport metadata, and the window is a way of looking at a screen, not part of what the screen is, so nothing about it reaches runtime content. Storage that is missing, blocked or full means the window forgets, as it did before. A host passes `rememberWindowAs` to name the screen and `windowMemory` to keep the sizes somewhere else.

The size class shown beside the buttons comes from Scene's own `computeSizeClass` with Scene's own breakpoints. The editor adds no breakpoints of its own, so the class you see while designing is the class Play picks for the same viewport.

### Read only

A slice that is done or under review still opens its screen, to be read. The host passes `readOnly` to `ScreenEditorOverlay`, and the editor wraps its controller in `readOnlyController`: elements can be selected and inspected, but every edit is refused, each property in the inspector is locked with the reason, nothing can be dropped onto the screen and the palette is not shown. The title bar says *Read only* in place of the save state and leaves out undo, redo and delete. Closing the window saves nothing.

## Palette

The palette is a set of headed drawers in the toolbar. Layout comes first, then one drawer for each package the UI profile loads. Each item carries a payload that says what it adds; the drawer hands it back untouched. Each drawer has a title from the editor's strings (a package with none is named by splitting its id into words) and each item an icon of its own, by component name. Each drawer opens as part of the toolbar it comes from: the same surface, border and elevation. Dragging an item onto the screen adds it where it is dropped. Activating it by click or keyboard adds it inside the selected container, after the selected component, or at the end of the screen.

A component is stored by its bare name so the UI profile decides which package implements it. The `action` that submits a modeled command is the exception: it is stored as `core:action`, because the editor's features depend on its meaning.

## Inspector

The inspector has two tabs.

- **Properties** is driven by Scene. It draws the generic controls for simple values, an ordered-item editor for collections such as navigation items, a query editor for data components, an action editor for buttons that submit a command, a layout type control for containers, and, while authoring a template, a section that decides what screens may change. Scene's diagnostics are shown inline.
- **Structure** shows the composition as a tree. You can select, reorder and reparent, and each row carries an ownership badge.

Structure edits work by pointer and by keyboard:

| Key | Effect |
|---|---|
| Up and Down | Move focus between rows |
| Left and Right | Collapse or expand, or move to the parent |
| Enter or Space | Select the row |
| Alt with Up or Down | Move the component earlier or later among its siblings |
| Alt with Left | Move the component out of its parent, right after it |
| Alt with Right | Move the component into the sibling before it, as its last child |

A drag and a keyboard move are held to the same rules. A move is refused, and the reason is announced, when the component or the destination is locked, when the destination cannot contain components, or when the move would put a component inside itself. The editor checks first so it can say why, and Scene checks again, so a refusal means the same thing from either side.

## Ownership

Ownership comes from Scene. For every element in the composition the editor asks `inspect` whose it is, so it can never disagree with the engine about what is locked.

| Ownership | Selectable | Configurable | Structurally editable |
|---|---|---|---|
| This screen | Yes | Yes | Yes |
| Inherited | Yes | No | No |
| Inherited, configurable | Yes | Only its exposed settings | No |

Inherited content is drawn faded in the editor. The fading is chrome only: it is not stored in the screen and does not appear in Play. The selection outline stays at full strength.

### Configuring what a template exposes

A template author decides which properties the screens that use the template may change. Exposing a collection grants operations on it: adding, removing and reordering the screen's own items, and editing their fields. The screen's items are kept apart from the template's, so the template's fixed items are shown first, in order, and cannot be edited or moved past. Positions the editor reports are among the screen's own items.

An unexposed property is shown with the reason it cannot be changed rather than being hidden.

## Layout coverage

The Layout drawer offers the layout types below. Each name is mapped explicitly to a construct Scene already has; the editor does not introduce a second layout model.

| Layout | Scene construct | Arrangement | Drop and placement | Responsive behavior |
|---|---|---|---|---|
| Stack | Vertical `StackPanel` | Column | Appends; markers between siblings | Reflows with its parent |
| Row | Horizontal `StackPanel` | Row | Appends; markers between siblings | Reflows with its parent |
| Grid | `Grid` | Grid | Appends; markers between cells | Reflows with its parent |
| Container | `Panel` | Grouping | Appends; behaves as a neutral column | Follows its parent |
| Wrap | `WrapPanel` | Wrap | Appends; markers between siblings | Reflows by wrapping |
| Canvas | `Canvas` | Freeform | By pointer position; no order markers | Placed by `Canvas.Left` and `Canvas.Top` |
| Dock | `DockPanel` | None | Not offered: the editor cannot assign dock edges yet | Not applicable |

A container can be changed into another type among those Scene says it can become. A change that would drop settings is not refused outright: the editor shows what would be lost and applies the change only when you accept.

### Drop regions

Drop targets are computed from the document and each container's arrangement, never from the rendered DOM. `computeDropRegions` returns a region for every container the current scope may insert into, including empty ones, and a marker between every pair of siblings in a flow container. A freeform container gets its body only, because placement there is by position. The surface asks where the container and its siblings were drawn only to position the markers.

This is the approach chosen for the empty-container problem tracked in [Scene#49](https://github.com/Cratis/Scene/issues/49): Scene needs no design-mode renderer flag.

### Dragging and dropping

A drag from the palette, or of an element already on the surface, always has a target under the pointer. `resolveDropTarget` turns the pointer position into one answer for the whole surface: the innermost container under the pointer (the container around it when the pointer is on its edge), and within a container that has children the marker nearest the pointer. The surface draws the answer while the drag is over it: an insertion line between siblings, a highlighted empty container or screen, and the receiving container outlined. Over something a template owns, or an element's own content, it draws a not-allowed state and a release does nothing. What is drawn and what a release does come from the same resolution, so a drop lands where the marker was. A drag shows a card naming what is carried, Escape cancels it, and one drop is one undo step.

The selected element has a grip, for the pointer (it is hidden from assistive technology; the keyboard moves an element with Alt and the arrows in Structure, and adds one with Enter on a palette tile, and a polite live region says where a drag would land). Dragging it moves the element with the same markers, as one move that goes through the same validation as the Structure tree.

### Deleting with the keyboard

Delete or Backspace removes the selected element (once per press: a held key does not keep deleting), from the surface or from a row of the Structure tree, as one undo step, and selects the sibling that takes its place, else the previous one, else the container. `isDeleteKey` ignores the keys anywhere text is typed - inputs, text areas, selects, anything `contenteditable` or with a textbox role, rich text and code editors - and the screen's root and anything a template gives the screen cannot be removed.

## What the surface draws

The surface draws the screen the way Play does, with nothing of its own on the components. Three things make that so, and the check that proves it (`check-play-vs-surface.mjs`) compares what the key elements compute to in Play and on the surface:

- **The same registry and the same theme.** The screen is drawn inside `SceneThemeProvider` for the theme the UI profile names (`profileTheme`), so the screen has its theme's background and text, and the `--p-*` tokens PrimeReact reads. The surface paints no background of its own.
- **The component styles.** PrimeReact 11 components render structure and no class names; their look is `@primereact/styles`, handed to the provider as `defaults` (`screenEditorPrimeReactDefaults`). Without them a button is plain text, a card has no surface and a field has no box.
- **The host's look.** A host that has a look of its own passes it as `ScreenEditorAppearance` when it builds the runtime (`screenEditorRuntimeForProfile(applied, bundles, appearance)`). Its theme replaces the profile's for what the editor draws and plays, so the surface and Play still agree. A host with dark chrome passes a dark Scene theme written from its own palette, so a screen sits among its panels. The editor package owns no host's palette. A host that passes none gets the theme the profile names, light by default, as before, and the UI Profile workspace still previews the profile's own theme.
- **The theme's color scheme.** PrimeReact 11 resolves every light and dark value with CSS `light-dark()`, which follows `color-scheme`. The theme root takes the theme's scheme, so a light theme is light inside a host's dark chrome, as it is in Play.

The editor adds no styling to a component to imitate how it looks. A host that uses Tailwind scans the Scene packages (`@source`) so the utility classes they lay themselves out with exist.

A new screen is a flow layout, like every screen Play draws, and an element added to it goes in order. An element is only placed at coordinates when it is added to a canvas the document actually uses, and then where it was dropped, or stepped from the last. Dragging an element within a canvas moves it to where it is let go; moving it out of a canvas takes its Left and Top off; moving it in gives it a position - each the one undo step the move is (`canvasMoveEdits`). Left and Top are shown in the inspector only for an element held by a canvas.

The surface draws the screen with the registry Play uses, so a component looks as it will in Play. A component dropped on a screen has no properties yet and many draw nothing without them, so the surface draws each with sample properties (`designTimeSamples`) under whatever the element sets itself. The samples are only drawn; the saved screen carries only what was set, and a property the author empties stays empty. Content drawn from a sample is muted (opacity only - nothing that changes a component's size or spacing, so the surface lays a screen out as Play does), carries `data-studio-sample`, and says in a tooltip which properties to set; every property a sample stands in for is also described to the inspector under Content (`withSampleContentProperties`), so it can be set. A component that draws nothing at all - `data` - gets a compact chip; an overlay (a dialog, a toast, a tooltip, a mask, a busy indicator) is drawn in place as a framed preview of what it opens (`OverlayPreview`); a component that throws is shown as a note where it is, and one the UI profile does not provide is shown as a note instead of the renderer's own fallback. Containers are outlined, and an empty one has a visible drop hint.

### Portable components and placement

The portable core components ship without styling, so the editor gives them one (`PortableComponents.css`, in the theme's own `--scene-*` tokens): a navigation bar is a bar of pill items, drawn the same on the surface, in Play and in the miniature, in any theme.

An element added to a canvas without a drop point (a click or Enter in the palette) is placed at the left margin below the lowest element already there, with a gap (`placementBelow`), using the sizes the surface measured; content in flow counts where the flow drew it. A drop keeps the pointer position. The position is saved with the element, so the miniature of the screen draws the same layout.


## Screen templates

A template is known to its Scene document by its id, not its display name, so renaming it cannot orphan its content or its exposures. The template editor opens only once the saved template has arrived and the application's UI profile is known, because the editor makes its session once from what it is opened with. The queries a template may bind are those of the whole application, since any screen can use it.

Leaving the template editor waits for the save and stays when it fails, with a message; the edit is still there to try again. A save of the same document that is already being saved is not repeated.

A new screen seeded from a template copies the template's content from its document when it has one, and from the projection otherwise. What the template exposes stays with the template.

## Data binding

A data component's `query` property is bound with the query editor. The queries offered are the ones the editing scope can use, supplied by the host through `ScreenEditorEnvironment.queryCandidates`. The author chooses a query, maps each of its parameters to a value the screen provides, and chooses which result fields become columns.

A binding is built in steps, and Scene stores only one that holds together. The editor keeps the unfinished binding as a draft, shows Scene's diagnostics inline, and stores it the moment it is complete. A binding to a query that is no longer available is kept and reported, never silently dropped.

The preview of a data component always says what state it is in: no query chosen, the query missing, loading, no rows, an error, or ready.

## Actions

A button that submits a modeled command is an `action` component. The author chooses a State Change slice, maps each of the command's inputs to a value the screen provides, and chooses how the form is presented: run directly, ask in a dialog, or ask in a drawer.

- The command is the slice's id, never its name.
- An input whose name looks like an identity is wired to `row.id` by suggestion; the author can change it.
- The editor reports a state change that is gone, a required input nothing feeds, an input the command no longer has, and a value the screen does not offer.

## Icons

An icon is chosen with the shared icon picker, in the Properties tab for an `icon` property and in each row of an `items` collection such as navigation. It browses the icon libraries of the application's UI Profile and stores a qualified reference: the library, the key and, when the icon has styles, the variant. The same name from two libraries is two different icons, and the library is stored with the choice.

Scene checks the icon on every edit, using the profile's icon catalog the runtime carries (`ScreenEditorRuntime.icons`). An icon its library no longer has, or a library the profile no longer includes, is reported next to the field and in the inspector; the stored value is kept until the author chooses another icon. A property the template does not expose is shown but cannot be changed.

The UI Profile review lists the icons stored screens use that a change to the icon libraries would leave unresolved. `collectProfileIconUsages` finds them in the saved documents.

## Objects, collections and lists

No property is edited as JSON text. A property that holds a structure is edited through what its descriptor describes, in the Properties tab, nested as deep as the descriptor goes:

- An `object` whose descriptor lists its `properties` is a group of fields, one for each property, each edited by its own kind: text, number, flag, choice, or another object, collection or list.
- A `collection` is a list of items. Each item is a group of the fields its `item` descriptor lists, with add, remove and move up or down. Every item has an identifier Scene requires and the editor assigns; position is never identity. A collection of navigation items - fields `label`, `icon`, `destination` only - is drawn by the ordered-item editor instead.
- A plain list of words or numbers is a `json` property whose editor kind is `studio.stringList` or `studio.numberList` (the kind names keep the `studio.` prefix they were stored under): one control for each entry, with add, remove and move. It is stored as the array it is.
- A descriptor that is `open` (the object's, or a collection's `item`) keeps fields it does not describe exactly as stored; the editor never shows or changes them.

The runtime describes the properties a component shows from a design-time sample (`designTimeSamples.ts`) by the shape of the sample (`describeSampleValue`): a list of records is a collection with the records' fields, a record is an object, and a list of words is a list. A property a package's descriptor only calls "any JSON" takes the shape of its sample and keeps its label, group, description and constraints (`withSampleContentProperties`).

A package that wants a different editor registers it for the property's `editorKind`; `DesignTimePropertyEditorsSection` draws it, and the structured editor leaves that property alone.

A property that holds an object or JSON that nothing describes, and for which no package registered an editor, is reported in the Properties tab as a diagnostic ("Properties without an editor") rather than drawn as a box to type JSON into: the gap is fixed in the component's descriptor. A binding literal of such a type cannot be authored for the same reason; a literal of a described structure is edited by the same fields.

A value saved before its descriptor described it - a table's rows without the identifiers a collection's items have - is not edited blind. The tab says it does not fit, and offers to give its items identifiers (when that is all it takes) or to clear it.

A host supplies the words as `properties.structured` and `properties.undescribed` of `ScreenEditorStrings`; without them the English in `defaultStructuredEditorStrings` and `defaultScreenEditorStrings` is used. The editor is exported from the screen editor entry as `StructuredValueEditor`.

## Play

Play draws the same composition through the same renderer and name resolution, with the configuration the templates were given, and none of the editor's chrome. Icons are drawn by the adapters of the profile's icon libraries (`ScreenEditorRuntime.iconAdapters`), which Play and the editor both provide. `PlayScreenView` is the entry point. The editor and Play are specified to produce the same markup for the same document.


## UI profile

The UI profile designer receives what the application's saved screens rely on, collected from their documents: the components they place, the templates they use, and the layouts and slots they fill. A profile that would leave a saved screen unable to be shown is refused.

## UI profile designer

The UI profile is designed in a window of its own at `/ui-profile` (the application tree's UI Profile node points straight at it; the older `/blueprint` route still redirects there so bookmarks and links keep working, `uiProfileRoutes.ts`, with a spec). **Click the preview, edit in one inspector**: the preview of the application is the way into one scrolling inspector, and nothing else is a place to edit the profile. There is no structure tree, no properties pane and no configurator cogwheel (the shell's floating configurator is not drawn in the preview).

The design is the prototype and walkthrough in Scene's `Documentation/blueprints/ui-profile-designer-prototype`; its behavior is the specification and Scene's [designer contract](../blueprints/ui-profile-designer-contract.md) says who answers what. **The editor owns no rule about a profile** (REN2): the package list, the problems and their fixes, the contrast of an accent, the theme and shell cards, the version rule, the menu modes, the regions of the preview and the status classes of the sample data are all answered by Scene - one call each in `Inspector/sceneAnswers.ts` - and the editor draws them and applies the edits Scene answers.

### The window

- **Header.** The application, the named **Undo** and **Redo** (the label of the edit they take back or return, `Undo accent`), whether the work is saved (*All changes saved*, *Unsaved changes*, *Saving…*, *Couldn't save* with *Retry*) and the **device** switch (desktop, mobile).
- **Stage.** The application as the profile resolves it, in `ScenePreviewHost`, at the chosen size (1280 × 720 or 390 × 844) and scaled down to fit, never up (`stageScale.ts`). The preview keeps its own width, so a phone is a phone whatever the room. **Hovering** a region outlines it and names it; **clicking** selects it and takes the inspector to the section that edits it. A click on a menu entry still navigates the preview and also selects the menu. The outline is placed from Scene's `regionRect`, in the preview's own pixels, so it stays right when the preview is scaled.
- **Inspector.** Six sections in one scroll - **App**, **Shell**, **Look**, **Menu**, **Packages**, **Sample data** - with tabs that smooth-scroll to a section and flash it, and that follow the scroll when the author moves it. Scrolling moves the selection outlined in the preview. With a preference for reduced motion the tabs jump and the highlight is still.
- **Status bar.** What the last edit said besides what it did (*Menu mode set to Slim by Minimal*), what a click on the hovered region would edit, the size and the regime of the preview (`390 × 844 · Compact width · Touch`) and the **problems chip**.
- **Starter bar.** An application that has never stored a profile shows one line over the preview with *Start from a blueprint*, *Use my own shell* and *Keep the defaults*. The first two take the author to the Shell section; nothing is stored until the first edit.

### The sections

- **App.** The *Name* (the application stores it, so a rename and the profile are sent together; it is one undo step like any other edit), the *Target platform* (web, the one the editor draws for), *New screens start from* (the template picker), the *Default size class* and the **logo**: initials, one of eight icons or an image (PNG, JPG, SVG or WebP, up to 400 KB, chosen with a file picker and kept inline), and whether the name shows. The limits and the messages are Scene's (`resolveProfileIdentity`), and the preview draws the logo and name in every shell.
- **Shell.** The shells as **cards** (title, description and the menu mode choosing one starts in, from `describeShellCards`), the **version rule** with its status chip (`describeVersionRule`), and the value of *my own shell* (a package name or a path, `describeOwnShellValue`). *Change shell…* opens the template browser; choosing a shell that needs no remapping applies at once and says which menu mode it set, and one that leaves content without a slot asks what happens to it first.
- **Look.** The *color scheme*, the **theme cards** (scheme, accent, corners, and the package a theme needs, which selecting it adds), the **accent** with its contrast against white and the grade (`contrastAgainstWhite`), the **font** from Scene's catalog with its sample line, and the **corners** (sharp, theme default, round). Switching the scheme moves a theme of the other scheme to the matching *Scene Default* theme and says so.
- **Menu.** The eight **menu modes** as cards with Scene's schematics, names and descriptions (`menuModeCards`), and the **menu theme** (light, dark, primary). The mode and the theme are the shell's typed options.
- **Packages.** One ordered list, highest priority first, with Scene's **reason** for each row and a **lock** on the ones that cannot go (the core, the shell's blueprint, a package another one needs). Moving (the buttons, or `Alt`+`Up`/`Down` on a row), removing and adding are Scene's edits (`movePackage`, `removePackage`, `addPackage`); a refused edit says why in the status bar, and adding a package adds what it needs. The **supplier table** lists the components two packages supply and which one wins, and a field answers *which package supplies this component?*.
- **Sample data.** The packs as cards with Scene's description and columns, the **status colors** Scene classifies, the note that production builds never include sample data, and **Manage packs…** (the application's own packs, and the mapping of their shapes to read models). The preview draws with the chosen pack.

### Problems

The problems chip counts what is wrong and opens the **problems panel**. Each problem has a severity in words (*Blocker*, *Warning*, *Info*), a message with real names, a way to the section it belongs to and, when Scene has one, a **one-click fix** - *Add package*, *Use theme accent*, *Use default blueprint*, *Use initials*, *Switch to Drawer* - which is one named, undoable edit. The panel lists Scene's problems (`findProfileProblems`) with the ones only the host can see (a package the profile cannot resolve, a sample data pack that is gone, and what the host refused when the last save was attempted); a refused save keeps the editor open with its draft and shows the host's sentence there. Removing a package that a theme needs raises *theme needs a package*; it never changes the theme.

### Undo and redo

The session is the history (`ProfileSession`): every edit is a named step, the label is the one the header shows, and a run of the same edit within a second - typing a name, dragging an accent - is one step, so undo takes the whole run back. `Ctrl`/`Cmd`+`Z` undoes and `Ctrl`/`Cmd`+`Shift`+`Z` (or `Y`) redoes, ignored while typing in a field. A new edit after an undo clears what could have been redone.

An own shell (an application template whose document says it is the root) is drawn from that document: the canvas and the shell chooser's candidate put the application's own templates, with the content and arrangement they declare, into the application the preview host composes (`previewApplicationOf`; `ApplicationTemplate.template` is read back from the saved document by `readScreenTemplate`). Leaving a blueprint's shell for an own one keeps that blueprint among the packages as one whose templates are offered (`withRootTemplate`), because an own shell made from AppShell places the blueprint's components - without them the canvas would say `Unresolved component`. The author removes the blueprint in Packages when nothing uses it.

### What the designer hands back

The designer stores nothing. It calls the host's `onSave` with a `DesignedProfile` and waits for the outcome, so the host decides where the profile lives and what it is checked against; rejecting, or resolving unsuccessfully, keeps the edit and offers a retry. `uiProfileDocumentOf` builds the document from the designer's settings and keeps what the designer does not edit exactly as it was stored: the root template reference (its version pin, or an own template the settings cannot express), its other options and the defaults stay unless their setting changed.

The members Scene added for the designer - the **identity** (name, logo kind, initials, icon, image, show name), the **font** and the **corners** - are the `style` of the document. A profile stored before them reads as Scene's defaults. The **menu theme** and the typed menu mode are shell options and travel in the root's options (`navigationMode`, `menuTheme`).

The logo image is kept **inline** in the style (a `data:` URI), at most 400 KB: one fact with no second store to keep in step, and what Scene's preview draws is exactly what is stored. A host validates the style with Scene's own rules (`ProfileIdentityResolver`, `FontCatalog` and `ShellOptions` in C#; `resolveProfileIdentity` and its neighbours in TypeScript), so an oversize or unsupported image, three or more initials and an unknown icon, font, corner style, menu mode or menu theme are refused with the sentence the designer shows while the author types.

The **default size class** (`compact`, `regular`, `expanded` - the profile's `target size`) is `UiProfileSettings.sizeClass`; a host that wants it apart from the profile document stores it as its own fact.

**Stored root.** The root template the author chooses lives in the settings as `root` (Scene's `RootTemplate`: the template with its version pin and the options of the shell). `withStoredRoot` reads what the host stored into it when the designer opens, and `uiProfileDocumentOf` writes it back with the navigation mode among the options, because readers of the older shape read it from there; a profile stored in the older shape, or one whose author never chose a root, opens and saves as the blueprint's first layout. Scene's diagnostics for the shell (`rootTemplateUnknown`, `rootTemplateVersionNotSatisfied`, `rootTemplateNotApplicable`, ...) are listed in Problems on the Shell node with the engine's own codes and messages.

**Own shells.** An own shell is an application template whose document says it is the root: `ownShellDocument` writes it with role `Root`, scope `Application`, its slots and its primary slot, and `readTemplateMetadata` reads those back into the application's templates, so Scene lists it beside the blueprints' shells and resolves it like any other. *Create new shell…* starts from Blank (one `content` slot), a copy of the current shell or a copy of the blueprint's AppShell; the host adds the template, saves the document and takes the template back if the document is refused. *Edit…* opens an own shell in the template editor; a blueprint's shell is edited by creating a copy of it. Moving the content of screens out of a slot the new shell lacks is the host's `onRemapSlots`; a host without one gets a switch that says it needs one instead of doing nothing.

The host gives the node a `ShellHost` with the template browser's assets and words, the application's screens (`screensOfDocuments` reads them from the saved documents) and, when it can, editing and creating a shell and moving content out of a slot; what the host does not give is not offered, with the reason shown, rather than done silently. See [host seams](host-seams.md).

### Keyboard and accessibility

Every region of the preview is one tab stop and `Enter` selects it. The tabs are a tab list, the sections are tab panels and the card groups are radio groups with the selected card checked. Shortcuts are ignored while typing in a field. The editor's chrome follows the system theme with the rest of the host (it reads the host's own `--cratis-*` variables, see [host seams](host-seams.md); the preview is drawn by the profile's theme and does not follow it), and a preference for reduced motion removes every animation. A host that drives the designer in a real browser should scan it with axe and fail on serious or critical violations.

### Testing

The logic is in specs next to it: the session and its merged steps, the adapter between the settings and Scene's profile (`sceneProfileOf`), the section tracking, the stage fit, the regime, the problem list and the stored style. The end-to-end journey (the real window in a real browser, with only the trip to the host's server replaced) is the host's: see [host seams](host-seams.md).


### Navigation on the canvas

The canvas is Scene's `ScenePreviewHost` with the `{ application: true }` target, so the shell's navigation really navigates: a click on a sidebar, topbar or breadcrumb entry opens its screen in the host's own memory history and the page's address never changes. `previewApplicationOf` builds the application document (one screen per screen template of the resolved packages, the full-page ones in the full-page shell) and the host composes it with the same function Stage uses to ship the application, so nothing is composed twice. In design mode a click also selects the entry (Alt-click only selects) and the destination shows as a read-only peek under a slim bar (`PeekBar`: Back or Escape returns to the chosen screen, Enter opens it in the editor). The *Showing* picker (`ShowingPicker`) lists Scene's `listDestinations` - pages, states and dialogs - and drives the same history. Preview mode behaves as the application does and Escape leaves it. An entry the host draws as dead (`data-nav-problem="navTargetMissing"`) is listed on the Problems tab under the Shell. `Navigation/` holds the pure rules (`peekOf`, `navigationKey`, `destinationLabel`) with their specifications.

### The application shell around the screen

The editor draws the screen inside the application's shell - the topbar, sidebar and breadcrumb the profile's effective shell
(`effectiveShellOf`: the screen template's own `applicationTemplate`, else the profile's `application.template`) gives it - so the author
sees the screen as the user will, not floating in an empty window. `ShellFrame/frameInShell.ts` composes the shell with Scene's
`composeApplicationScreen` and a template library of the profile's bundles, with the screen placed in the shell's primary slot
(`spliceContent` swaps the shell's content element for the screen being edited, so no copy of the screen is made).

- The shell is **not editable here**. A press on it never selects anything of the screen (`decideShellPointer`); a click on one of its
  navigation entries peeks the destination, the same way the profile designer's canvas does, with a *Back* button and Esc to return. The
  screen under edit is untouched, and the page URL does not change.
- A toolbar toggle (*Show application shell*) turns it on or off. The choice is remembered per user (`ShellPreference`, local storage).
  It is **off** by default for a screen - a slice's prototype is the slice's own content and nothing but - and for a dialog template and
  the shell template itself, where wrapping it in itself makes no sense. It is on by default only for a screen template being authored,
  which is the application's page and is authored in it.
- A second toggle (*Show the template around this content*, `ShellState.template`) draws what the screen's template puts around the slice's
  content, in place, and is remembered per user the same way. With it off the surface draws only what the screen itself authored
  (`Templates/ownContentOnly.ts`); the document, the structure and the drop regions are still those of the full composition, so showing the
  template puts back exactly what was there.
- A screen that opens as a dialog or a drawer is drawn as that popup over a backdrop, never in the application's shell, and the shell toggle is
  not offered for it. What opens as a popup is decided by one function (`displayedFitsOf`) that every part of the editor reads: the fits the screen
  lists, else the template it names (a dialog template makes it a dialog, a screen template a page), else a dialog for the screen of a State
  Change slice and a page for any other, so a State View screen is a page. The button row of the dialog comes from the dialog template the
  screen names.
- The shell's navigation comes from the application's structure and navigation model, the same ones the screen's own navigation
  regions read.


## Template browser

`TemplateBrowser` is the one rich browser of templates (spec 6).
It lists the application's own templates and every blueprint's: a rail (*All templates*, *My templates*, each blueprint with its count, then the blueprints the profile does not
have yet under *Needs a blueprint…*), a card grid with the thumbnail, description and badges from the blueprint catalog, a filter (`/`) and category selector, and a pane that draws
the selected template with the application's profile, in the state and width chosen. A blueprint template is previewed as its screens (a filmstrip when it has several), under the
profile it would have if the blueprint were added; *Preview the whole blueprint* runs the whole blueprint application. Nothing in it is a second description of a template: the
entries are Scene's `describeTemplateCatalog`, applicability is Scene's `applicableTemplates` and `validate*ForTarget`, "update available" is `evaluateBlueprintPin`.
`describeTemplateBrowser` is the model (specs: `for_describeTemplateBrowser`), `availableActions` says what a template offers in a mode (`for_availableActions`).

- **Page** - the host shows the browser as a page, where its manage mode offers *New template*, *Edit*, *Rename*, *Duplicate*, *Delete* on the
  application's own templates, *Copy to my templates* on a blueprint's screen template (the copy is the template as the blueprint wrote it, metadata, attribution and license
  included, under a new identifier of the application), *Add blueprint to this application* on a template of a blueprint the profile does not have (it adds the pack to the
  profile, like the blueprint gallery does). Every one of those is a handler the host supplies (`TemplateBrowserActions`); none is offered without one.
- **Dialog** - every picker's footer **Browse all…** (module, feature and slice headers) opens it in pick mode for the level the picker is for: what does not fit is hidden, and
  "N templates that do not fit {level} are not shown" says so; choosing closes it and stores the choice exactly as the picker's own menu does. No management actions there.
- **Keyboard** - `/` focuses the filter, arrows/Home/End walk the cards, Enter chooses (dialog) or edits (page), Esc clears the filter.
- **Storage** - renaming, removing and copying are the host's commands; a copy is an add followed by a save of the document, and is taken back if the document is refused.

## Blueprint gallery

The UI profile designer has a **Blueprint gallery** (spec 6): the domain blueprints Scene ships - approvals, CRM, ticketing - as cards with their thumbnail,
description and version, what you get (the screens in navigation order, the templates by category, the sample data packs) and what they require. It is not a second
description of the blueprints: the cards are Scene's `describeBlueprintCatalog` over the loaded bundles (the same entries each package's `blueprintCatalog.json` holds
and both engines assert), and "update available" is Scene's `evaluateBlueprintPin`, the one rule for what a reference's pin says about the version on offer.
`referenceUseOfPin` reads the version a reference was chosen from out of its range.

- **Add.** A card adds the blueprint to the draft profile's template packs, or removes it; the profile stays a draft until it is reviewed and applied, so the change
  lists in the review like any other. The shell is chosen in *Packages & resolution*: the domain blueprints bring no layouts and so cannot be the shell.
  A package the profile has only because another needs it is shown as required and cannot be removed here.
- **Preview.** A card runs the blueprint as the application it is: Scene's preview host with the blueprint's own `<name>Application()` document, its navigation model and the
  sample data of one of its packs, under the same strip as the application preview. It reads from the packages and writes nothing. Leaving it - `Back to gallery · Esc` -
  returns to the card where it was.
- **Where it opens.** Where the host places it: the gallery is a component (`BlueprintGallery`), and every template picker ends in **Browse all…**, which opens the template browser above.
- **Assets.** The thumbnails and sample-data packs are files in the blueprint packages. How a file in a package becomes a URL is the bundler's business, so the editor
  package asks its host (`BlueprintGalleryAssets`). A Vite host finds them with `import.meta.glob` over the blueprint packages and loads a pack only when a preview asks; `noBlueprintGalleryAssets` is the host that has none.
- **Adding a blueprint.** Add its package to this package's dependencies, its bundle to `domainBlueprints` and its application to `blueprintApplications`.

