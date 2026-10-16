---
title: The root template
description: How a UI profile names the application's shell - the root template - its options, its appearance and the defaults it carries.
---

An application's **root template** is its shell: the chrome every screen is placed inside. A UI profile names it with
`root`, instead of the bare layout name `layout` offered before.

```csharp
public record UiProfile(
    string Name, string TargetPlatform, IReadOnlyList<string> Packages,
    TargetSizeClass? DefaultSizeClass = null, string? Layout = null, string? Theme = null,
    SampleDataSelection? SampleData = null,
    RootTemplate? Root = null, ProfileAppearance? Appearance = null, ProfileDefaults? Defaults = null);

public record RootTemplate(TemplateReference Template, IReadOnlyDictionary<string, JsonNode?>? Options = null);
public record ProfileAppearance(ColorScheme? ColorScheme = null, string? Accent = null);
public record ProfileDefaults(TemplateReference? NewScreenTemplate = null);
public enum ColorScheme { Light, Dark, System }
```

The TypeScript mirror (`@cratis/scene.model`) has the same members in camelCase: `root`, `appearance`, `defaults`.

## The reference

`Root.Template` is the same `TemplateReference` that screens and slices use: `source` is `Own` (a template of this application)
or `Blueprint`; `id` is the template's name; a blueprint template also names its `blueprint` and pins it with `version`, a
semver range such as `^4.5`. Absent `version` accepts any version.

```json
{
  "name": "Desktop",
  "targetPlatform": "web",
  "packages": ["core", "Cratis.Components"],
  "root": {
    "template": { "source": "Blueprint", "id": "AppShell", "blueprint": "Cratis.Blueprint.Default", "version": "^4.5" },
    "options": { "navigationMode": "slim", "showFooter": true }
  },
  "appearance": { "colorScheme": "Dark", "accent": "#4f46e5" },
  "defaults": { "newScreenTemplate": { "source": "Blueprint", "id": "Workspace", "blueprint": "crm", "version": "^2.0" } }
}
```

## Options, appearance and defaults

- `Root.Options` are the shell's own configurable items, keyed by the shell's exposed option name (navigation mode, whether to
  show the footer, density...). The values are JSON; which names are valid is the shell's business, not the profile's.
- `Appearance` holds the colour scheme (`Light`, `Dark`, `System`) and the accent colour, which sit beside the theme rather than
  inside it. Either may be absent to keep the theme's own value.
- `Defaults.NewScreenTemplate` is the template a newly created screen starts from.

## Legacy `layout`

`Layout` stays in the model and stays readable: a profile that only names a layout keeps working. Readers accept both
shapes; when both are present the root template wins. Writers should always emit `root`.

## JSON form

`Cratis.Scene.Engine.Profiles.UiProfileJson` (C#) and `parseUiProfile`/`serializeUiProfile` (TypeScript engine) read and write a
profile in one canonical form, byte for byte identical, proven by the shared corpus `ui-profile-fixtures.json`:

- names are camelCase and enum values are their declared names (`Own`, `Blueprint`, `Dark`); readers match them
  case-insensitively;
- absent members are omitted, and the text has no whitespace;
- keys follow the model's declaration order for the profile, the root template, a template reference, the appearance and the
  defaults; every other object (the sample-data selection, shell options) is ordered by ordinal comparison; arrays keep their order;
- readers ignore members they do not know, and a document written before `root`, `appearance` and `defaults` existed loads and
  writes back unchanged.

## The root role

A shell is either a **layout** or an **application-scope screen template with the root role**. A screen template takes the role with
`metadata.role: Root` (C# `TemplateRole.Root`); it is offered only at the `Application` scope, must not fit any slot (nothing contains
the shell), and `ApplicableTemplates` at the `Application` scope lists layouts and root screen templates side by side. A dialog
template can never take the role. `metadata.primaryOutlet` names the slot every screen's content is placed in; it is `content` when
absent.

## The effective shell

`resolveEffectiveShell(profile, context)` (TypeScript, `@cratis/scene.engine`) and `ShellResolver.Resolve(profile, context)` (C#,
`Cratis.Scene.Engine.Shell`) are the one place the question "what is this application's shell?" is answered, for every host. They are
asserted against the same corpus, `effective-shell-fixtures.json`.

The order is:

1. `profile.root` - the pinned template reference;
2. the legacy `profile.layout` name, looked up in the application and then in the installed blueprints;
3. the default layout (or root screen template) of the first installed blueprint;
4. the built-in **Bare** shell: one `content` outlet and no chrome.

A candidate that cannot be used at all - it does not exist, its blueprint is not available, it is a dialog template or a screen
template without the root role - is reported and the next one is tried, so there is always a shell to render. A candidate that exists
but is wrong in a way the host can still show (a pin the installed version does not satisfy, no `content` outlet, a blueprint that is
available but not among the profile's packages) is used and reported.

The result carries the pinned `reference`, the `template` (a layout or a screen template), its `kind`, `source` (own, blueprint,
built in), the supplying `package` and its installed version, the pin evaluation (`Current`, `NotSatisfied`, ...), the `outlets` in
declaration order, the `primaryOutlet`, the profile's `options` and the `diagnostics`.

## Diagnostics

The codes are camelCase and engine-owned; every message carries real names (templates, blueprints, screens, outlets, packages),
never ids.

| Code | When |
|---|---|
| `rootTemplateUnknown` | The root template (or the legacy layout name) does not exist. |
| `rootTemplateVersionNotSatisfied` | The pin does not match the installed blueprint version (the shell is still used). |
| `rootTemplateNotApplicable` | The template cannot be a shell: a dialog template, a screen template without the root role, or a root template that fits a slot. |
| `rootTemplateMissingContentSlot` | The shell has no outlet for the screens' content. |
| `rootTemplateCycle` | Templates that nest inside the shell contain each other and can never be placed. |
| `rootTemplateBlueprintNotInstalled` | The root template's blueprint is unavailable, or available but not among the profile's packages. |
| `profileThemeIncompatible` | The profile's theme does not support every package of the profile. |
| `profilePackageMissing` | The profile lists a package that is not available. |
| `profileSlotUnplaced` | A screen puts content in an outlet the shell does not have. |

## Blueprint catalog

`blueprintCatalog.json` describes the shells a blueprint ships: a catalog template entry for a layout or a root screen template
carries `outlets` (in declaration order), `primaryOutlet` when it is not `content`, and `role`.

Still to come in the follow-on engine issues: shell switching and the legacy migration helper.
