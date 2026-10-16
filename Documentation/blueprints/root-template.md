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

This page is completed by the engine issues that follow: effective shell resolution, version pin drift and diagnostics, shell
switching, and the legacy migration helper.
