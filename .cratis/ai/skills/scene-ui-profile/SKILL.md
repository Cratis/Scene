---
name: scene-ui-profile
description: Author, review or host a Cratis Scene UI profile - the root template (shell) with its pin and options, appearance, defaults - and preview it with navigation that really navigates. Use when a task names `root`, `layout`, `resolveEffectiveShell`, a shell/root template, `ScenePreviewHost`, `listDestinations`, `navigationMode`, `menuTheme`, `identity`, a logo, corners, a font, a profile problem or fix, a region of the preview, or a menu/topbar/sidebar/breadcrumb that does not navigate. Do not use for screen content, slices or sample-data packs.
license: MIT
---

# Scene UI profile

A UI profile names the application's **shell** (the root template) and its look. Read the references before changing anything:

- `Documentation/blueprints/root-template.md` - the model, the reference and pin, options, the root role, resolution order, diagnostics.
- `Documentation/blueprints/ui-profile-designer-contract.md` - who answers what, the navigation rules N1-N9 (N9 is the regions), and the decisions that are still open.
- `Documentation/blueprints/layout-modes.md` - the eight menu modes, the typed `navigationMode` and `menuTheme` options and the touch regime.
- `Documentation/blueprints/preview-host.md` - `ScenePreviewHost`, `initialDestination`, `navigationMode`, `listDestinations`.
- `Documentation/blueprints/navigation-regions.md` - the effective navigation the shell draws.

## Do

1. **Write `root`, not `layout`.** `root.template` is a `TemplateReference` (`source` Own or Blueprint, `id`, `blueprint`, `version` as a semver range such as `^4.5`); `root.options` holds only options the shell exposes. `layout` is the legacy form, still read, never written.
2. **Ask the engine.** The shell an application has is `resolveEffectiveShell(profile, context)` (C# `ShellResolver.Resolve`); what may be a shell or a new screen's template is `applicableTemplates`; the canonical text is `parseUiProfile`/`serializeUiProfile` (C# `UiProfileJson`). Show its `diagnostics` unchanged - codes `rootTemplateUnknown`, `rootTemplateVersionNotSatisfied`, `rootTemplateNotApplicable`, `rootTemplateMissingContentSlot`, `rootTemplateCycle`, `rootTemplateBlueprintNotInstalled`, `profileThemeIncompatible`, `profilePackageMissing`, `profileSlotUnplaced`.
3. **Make a template a shell** with `metadata.role: Root` at the Application scope; it must not fit a slot, may not be a dialog template, and names `metadata.primaryOutlet` unless the primary outlet is `content`.
4. **Preview with the real host.** `ScenePreviewHost` with `target={{ application }}`, `{ module, feature }` or `{ slice }`; start elsewhere with `initialDestination` (`{ screen }` or `{ dialog }`); offer places with `listDestinations(document)` (Pages, States, Dialogs). Never build a second renderer for the shell.
5. **Decide what a click does.** End users and Stage navigate (the default). A design host sets `navigationMode="select"` and reads `onActivate`; Alt-click selects in any mode. `onNavigate` reports every move.
6. **Know the members of the profile.** `identity` is the name and logo (initials, one of eight icons, or an inline image up to 400 KB; `showName`); `appearance` is `colorScheme`, `accent`, `corners` (`Sharp`, `Default`, `Round`) and `font` (an id of `fontCatalog`) - resolve them with `resolveProfileIdentity` and `resolveAppearance`, never by hand; `root.options.navigationMode` (`static`, `overlay`, `slim`, `slimPlus`, `compact`, `horizontal`, `reveal`, `drawer`; the legacy `slim-plus` still reads) and `root.options.menuTheme` (`light`, `dark`, `primary`) are typed options. Choosing a shell sets the mode to its `metadata.defaultMenuMode`; the author may change it afterwards.
7. **Show problems, never compute them.** `findProfileProblems` returns blockers, warnings and information with a `severity`, a `section` and a `fix`; `applyProfileFix` applies the fix (one undoable edit); `contrastAgainstWhite` grades an accent. Removing a package that a theme needs raises `themeNeedsPackage` and never changes the theme.
8. **Draw pickers from the metadata.** `describeShellCards`, `describeThemeCards`, `switchColorScheme`, `describeVersionRule`, `describeOwnShellValue`, `describePackageList` and its edits, `menuModeCards`, `classifySampleStatus` - all have shared fixtures; a designer owns no rule.
9. **Use the regions.** `ScenePreviewHost` reports `onRegionHover`/`onRegionActivate` with `identity`, `shell`, `menu`, `content` or `accent`; `regions.regionRect(id)` measures one in the preview's own pixels; `describeRegions(mode, touch, menuOpen)` says which are drawn and the fallback. Pass `viewportWidth` for a device preview (a touch width makes the menu a drawer).
10. **Test navigation as navigation:** click the item, assert the content slot, `aria-current="page"`, the breadcrumb and that `location.href` did not change; an item with a dead target carries `data-nav-problem="navTargetMissing"`.

## Do not

- Do not re-implement shell resolution, applicability, pin checks, diagnostics, breadcrumbs or destination lists in a host (REN2). Add the rule to Scene with a shared JSON fixture asserted by the C# and TypeScript engines (REN1).
- Do not write the host page's address from a navigating control; the history is in memory in a preview.
- Do not rely on an `isActive` prop where a navigation host is in scope - active state comes from the history location.
- Do not store session-only choices (viewport, peeked destination, selected item) in the profile.
- Do not compute a problem, a contrast ratio, a theme card, a version status or a region in a host; do not read a CSS class to find a region - read `data-scene-region`.
- Do not claim a profile member round-trips unless it is a member of `UiProfile` and covered by `ui-profile-fixtures.json`.

## Checklist before finishing

- The profile uses `root`; `resolveEffectiveShell` returns no unexpected diagnostics.
- Both engines' specs and the shared fixtures pass; docs list any new code.
- A spec clicks through the navigation and asserts the URL is untouched.
