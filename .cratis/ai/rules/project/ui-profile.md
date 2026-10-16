---
applyTo: "**/*"
---

## UI profile and shell navigation

When a task touches a UI profile, a root template, the shell's navigation controls or the preview host, load the `scene-ui-profile` skill first.

- A profile names its shell with `root`; the effective shell is answered only by `resolveEffectiveShell` (C#: `ShellResolver`). No host re-implements it.
- Menu items, topbar/sidebar items, breadcrumb crumbs, the logo and user-menu entries navigate through the navigation context (`useNavigationActivation`); they never write the address of the hosting page.
- Hosts that design (not run) an application pass `navigationMode="select"` and read `onActivate`; `Alt`-click always selects.
- New rules ship with shared JSON fixtures asserted by both engines.
