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
- `Appearance` holds the colour scheme (`Light`, `Dark`, `System`), the accent colour, the **corners** (`Sharp` 4 px, `Default` the theme's own, `Round` 18 px) and the **font** (an id of the font
  catalog: `inter`, `ibm-plex-sans`, `source-serif-4`, `system-ui`), which sit beside the theme rather than inside it. Every member may be absent to keep the theme's own value.
  `resolveAppearance` (C#: `AppearanceResolver`) turns it into the tokens a host applies - `primary.color`, `content.borderRadius`, `text.fontFamily` - and degrades a font that is not
  available to the system font with a diagnostic.
- `Identity` is the application's **name** and **logo**: initials (up to two characters), one of the eight logo icons (`box`, `layers`, `home`, `users`, `receipt`, `package`, `database`,
  `palette`) or an inline image (`data:` URI of PNG, JPG, SVG or WebP, up to 400 KB), and whether the name is shown beside it. `resolveProfileIdentity` (C#: `ProfileIdentityResolver`) answers
  what is drawn, with the diagnostics `initialsTooLong`, `iconUnknown`, `imageUnsupported` and `imageTooLarge`.
- `root.options.navigationMode` and `root.options.menuTheme` are typed, enumerated options; see [the layout modes](layout-modes.md#the-typed-options-and-the-touch-regime).
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

Switching the shell is planned by [`planShellSwitch`](#switching-the-shell) and applied by [`applyShellSwitch`](#applying-the-switch); what stops a profile is found by [`findProfileBlockers`](#what-stops-a-profile-from-being-applied); the nodes a designer edits are described by [`describeUiProfile`](#describing-the-profile-for-a-designer).

## Migrating a legacy profile

Before the root template, a profile named its shell as a **blueprint** (Studio's `Shell`) and a **layout name** (`UiProfile.Layout`), and Studio kept the
navigation mode, colour scheme, accent and default screen template as separate fields. `migrateLegacyProfile` (TypeScript, `@cratis/scene.engine`) and
`ProfileMigrator.Migrate` (C#, `Cratis.Scene.Engine.Profiles`) turn that into the new shape in one pure step. Studio's migration, the Screenplay fix-it and the CLI
all call it; none of them has its own copy of the rules.

```ts
const { profile, changed, diagnostics } = migrateLegacyProfile(
    { profile: legacy, shell: 'Cratis.Blueprint.CRM', layout: 'AppShell', navigationMode: 'Sidebar', colorScheme: 'dark', accent: '#4f46e5', defaultScreenTemplate: 'Overview' },
    library); // library.own = the application's templates, library.blueprints = the blueprints available
```

| Legacy | Becomes |
| --- | --- |
| `shell` + `layout` naming a layout (or root screen template) of that blueprint | `root.template` as a `blueprint` reference, pinned to `^<installed major.minor>` |
| `layout` found in the application | `root.template` as an `own` reference |
| `layout` found only in an installed blueprint (no `shell` named) | `root.template` as a `blueprint` reference |
| `shell` and no `layout` | the blueprint's first usable shell |
| neither | no root: the built-in Bare shell |
| `navigationMode` | `root.options.navigationMode` |
| `colorScheme` (any case) / `accent` | `appearance.colorScheme` / `appearance.accent` |
| `defaultScreenTemplate` | `defaults.newScreenTemplate` (own, or a pinned blueprint reference) |

The lookup order for a layout name is the one `resolveEffectiveShell` uses for a legacy layout: the named shell, the application, then the installed blueprints,
so migrating never changes which shell an application gets.

### Compatibility rules

- **Readers accept both shapes; writers always emit the new shape.** The loader keeps reading `layout`; whoever saves a profile saves the migrated one, and once a root exists the legacy `layout` is dropped.
- **Idempotent.** A profile that is already migrated comes back unchanged (`changed` is `false`), whether or not the legacy fields are passed again. A value already in the new shape always wins over its legacy counterpart.
- **Nothing is thrown, nothing is lost silently.** What cannot be mapped stays where it was and is reported, with real names:

| Code | When |
| --- | --- |
| `legacyLayoutUnknown` | the layout is in neither the application nor an installed blueprint (the profile keeps its `layout`) |
| `legacyShellNotInstalled` | the shell names a blueprint that is not available |
| `legacyShellHasNoLayout` | the shell is available but offers nothing an application can use as its shell |
| `legacyColorSchemeUnknown` | the colour scheme is not Light, Dark or System |
| `legacyNavigationModeWithoutRoot` | a navigation mode was set but the profile ends up with no root to carry it |
| `legacyDefaultScreenTemplateUnknown` | the default screen template exists nowhere |

The two engines are asserted against the same corpus, `profile-migration-fixtures.json` (29 permutations, each also migrated a second time).

## Authoring a profile

Write `root`, not `layout`, and let the engine - not your host - decide whether it works:

1. Pick a shell from `applicableTemplates` at the `Application` scope (layouts and root screen templates are offered side by side).
2. Pin a blueprint template with a semver range (`^4.5`); leave `version` out only for an own template.
3. Put only shell options in `root.options`; the shell owns the names.
4. Run `resolveEffectiveShell` and show its `diagnostics` - a host never invents its own checks (REN2).
5. Preview with the real host: [`ScenePreviewHost`](preview-host.md) with `target={{ application: ... }}` renders the shell with the
   application's navigation, and clicking an item really navigates. See [UI profile designer contract](ui-profile-designer-contract.md).


## Switching the shell

`planShellSwitch(current, candidate, screens, templates, remaps)` (TypeScript) and `ShellSwitchPlanner.Plan` (C#) is the pre-flight of "Use this shell". The host resolves the
shell in place and the candidate with `resolveEffectiveShell` (the candidate as the profile's root), hands both over with the screens and the templates a screen can be built from
(`placeableScreenTemplates` / `ShellPlacement.PlaceableScreenTemplates`), shows the plan, and on commit applies it as one undoable edit. The plan is pure data and identical in both engines.

The default mapping is **by name**, with the current shell's primary outlet following to the new shell's primary outlet (an outlet named `content` does too when the new shell has no
outlet of that name). Every outlet of the current shell - and any outlet a screen uses that the shell does not have - gets one entry in `moves`:

| `action` | Meaning |
| --- | --- |
| `keep` | the new shell has an outlet of that name; the content stays |
| `primary` | the content follows to the new shell's primary outlet, which is named differently |
| `unused` | the new shell has no such outlet and no screen uses it; nothing to decide |
| `unresolved` | the new shell has no such outlet and screens use it: a blocker until the user chooses (`choices` lists them) |
| `moveToPrimary` / `mapTo` / `drop` | the user's choice, passed back in `remaps` keyed by the outlet's name |

An unresolved outlet's message names the screens and outlets - *3 screens ('Customers', 'Tickets' and 'Invoices') place content in outlet 'subject', which shell 'AppShell' does not have* - never
ids or placeholders. A choice for an outlet that needs none is ignored; a `mapTo` to an outlet the new shell lacks is refused. `addPackages` lists the blueprint the candidate needs that the
profile does not yet have; `blockers` carries the candidate's own problems (`rootTemplateUnknown`, `rootTemplateVersionNotSatisfied`, `rootTemplateNotApplicable`,
`rootTemplateMissingContentSlot`, `rootTemplateCycle`) and every unresolved outlet (`profileSlotUnplaced`); `warnings` the rest (an incompatible theme). `canSwitch` is true when there are no blockers.

### Applying the switch

`applyShellSwitch(document, plan, templates?)` (TypeScript, `@cratis/scene.engine`) and `ShellSwitchApplier.Apply(screens, screenTemplates, plan, templates)` (C#) is what the host calls on commit. It is a pure function over the document - nothing it is given is changed - so Studio, the CLI,
MCP and Screenplay tooling all apply the same remap; none of them has its own copy of the rules. Call it once per saved document (Studio: each slice's screens and the templates), with the plan made from the whole application and `templates` set to
`placeableScreenTemplates` / `ShellPlacement.PlaceableScreenTemplates` so a template chain that crosses documents resolves.

```ts
const plan = planShellSwitch(current, candidate, screens, templates, remaps);
const { document: switched, applied, changes } = applyShellSwitch(document, plan, templates);
```

| Plan says | Screens built directly on the shell (`slotContent`) | Screen templates that fit the outlet (`fitsSlot`) |
| --- | --- | --- |
| `keep` | untouched | untouched - except a name qualified with the old shell's (`ToolShell.subject`), which is requalified with the new shell's (`DeskShell.subject`) |
| `primary`, `moveToPrimary`, `mapTo` | the outlet's content is appended to the target outlet | `fitsSlot` becomes the target outlet, keeping a qualifier (`OwnShell.content`); the screens built from the template move with it |
| `drop` | the outlet's content is removed | `fitsSlot` is removed: the template is placed explicitly, not by declaration |
| `unused`, `unresolved` | untouched | untouched |

- Content moved into an outlet is appended after what the outlet already holds, in the order of the outlets it came from. In a screen's `slotContent` the kept outlets come first, then the outlets the move created; an outlet the content left disappears, and an empty outlet no screen uses (`unused`) is left alone.
- A screen built from a screen template has no content of its own in a shell outlet - its template's chain is placed - so only the **outermost** template of the chain is edited; the inner templates fit slots of the outer one and stay.
- Only the document's own screens and templates are edited. A template that lives in an installed blueprint is not the application's to edit, and a screen's `layout` is not touched.
- A plan with blockers (an undecided outlet, an unusable shell) is not applied: `applied` is `false` and the document comes back as it was. A plan that changes nothing (the same shell, or nothing to move) comes back as `applied` with no `changes`, and the very document that was given.
- `changes` is the review list, screens first in document order and then templates: `kind` (`content` or `placement`), the `screen` or `template`, the `outlet`, the plan's `action`, the `target` (absent when dropped), the element `count` (1 for a placement) and a `description` with real names, never ids.

Both engines are asserted against `shell-switch-apply-fixtures.json` (the libraries and roots of `shell-switch-fixtures.json`): keep, the same shell, an outlet nobody uses, primary following to a differently named primary outlet, moving into an occupied primary outlet, mapping, several outlets into one,
dropping, a template that fits the lost outlet (moved, mapped and dropped), qualified templates, a nested template chain and a blocked plan.

## What stops a profile from being applied

`findProfileBlockers(profile, context)` (TypeScript) and `ProfileBlockers.Find` (C#) is the one place these rules live. Studio presents the result; it has no rules of its own.

| Code | When |
| --- | --- |
| `missingDependency` / `versionConflict` / `dependencyCycle` | the profile's packages cannot be satisfied |
| `shellUnusable` | the shell has one of the five unusable-shell codes (its own is in `shellCode`) |
| `themeIncompatible` | the theme is not marked compatible with a package the profile uses (every one is named) |
| `defaultScreenTemplateUnavailable` | the template new screens start from exists nowhere |
| `usedLayoutUnavailable` / `usedScreenTemplateUnavailable` / `usedDialogTemplateUnavailable` / `usedSlotUnavailable` | a screen relies on something the packages no longer provide |

`findProfileProblems(profile, context)` (C#: `ProfileBlockers.FindProblems`) returns those blockers and then the problems the profile can still be applied with. Every problem carries a
`severity` (`blocker`, `warning`, `info`), the `section` of the designer it belongs to and, when there is one, a `fix` the host applies as **one undoable edit** with
`applyProfileFix` (C#: `ProfileBlockers.ApplyFix`) - the same profile in both engines.

| Code | When | Severity | Fix |
| --- | --- | --- | --- |
| `themeNeedsPackage` | the theme comes from a package that is not in the list (for example after removing Material Themes) | warning | `addPackage` |
| `accentTooLight` | the accent has less than **3:1** contrast against white button text | warning | `useThemeAccent` |
| `ownShellHasNoValue` | *my own shell* is chosen and names nothing | warning | `useDefaultBlueprint` |
| `logoImageMissing` | the logo is an image and none is chosen | warning | `useInitials` |
| `revealNeedsHover` | the target is a touch size class and the menu mode is Reveal | info | `switchToDrawer` |

Removing a package that a theme needs **raises the problem and never changes the theme**: the profile stays as chosen. `contrastAgainstWhite(color)` (C#: `Contrast.AgainstWhite`) gives the ratio and
the grade - **AAA** from 7, **AA** from 4.5, **large text only** from 3, **fails** below - for a three- or six-digit hex colour, and a message for anything else.

Each blocker carries `code`, `subject` and a `message` with real names (*Screen 'Orders' uses layout 'CrmShell', which the packages of profile 'Desktop' do not provide*). Icon impact stays with
`analyzeIconImpact`, which already lives in the engine.

## Describing the profile for a designer

`describeUiProfile(profile, context)` returns one component descriptor per node of the profile - Application, Shell, Theme, Packages, Sample data (`UiProfileNodeKind`) - in the
existing descriptor format, so a host renders them with the property-editor registry it already has. A property's `path` is its path in the profile (`appearance.colorScheme`,
`defaults.newScreenTemplate`, `root.options.navigationMode`), and the labels, groups, choices, defaults, constraints and the reason a theme does not fit are the engine's. The context supplies the
choices the application has (themes, packages, platforms, sample-data packs, the shell's options and navigation modes); an absent list leaves a property free-form. A theme the profile's packages do
not support is still offered, with the reason in the choice's description.

## Pickers

A host draws its pickers from Scene's metadata alone:

| Picker | Answered by |
| --- | --- |
| Shell cards (title, description, wireframe, default mode) | `describeShellCards(library)` (C#: `ShellCards.Describe`); a shell is a card when it declares `metadata.defaultMenuMode`, and `verifyBlueprintPackage` fails one without a title, a description or a thumbnail |
| Theme cards (scheme, accent, corners, the package selecting it adds) | `describeThemeCards` (C#: `ThemeCards.Describe`) |
| Switching the colour scheme moves a theme of the other scheme to the matching *Scene Default* theme | `switchColorScheme` (C#: `ThemeCards.SwitchColorScheme`) |
| The version rule - *follow compatible versions*, *pin*, *always the latest* - and the status chip | `describeVersionRule` (C#: `VersionRules.Describe`), from the package resolver |
| The value of *my own shell* - a package name or a path | `describeOwnShellValue` (C#: `OwnShells.Describe`) |
| The package list - reasons, locks, what can be added, moves | `describePackageList` and the edits (C#: `PackageList`) |
| The eight menu mode schematics | `menuModeCards` of `@cratis/scene.blueprint.default` |

The shared corpora are `shell-switch-fixtures.json`, `profile-blockers-fixtures.json`, `profile-pickers-fixtures.json`, `package-list-fixtures.json`, `shell-options-fixtures.json`,
`shell-regions-fixtures.json`, `profile-identity-fixtures.json` and `profile-appearance-fixtures.json`; each is asserted by both engines.
