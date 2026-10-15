---
title: Ship your own blueprint
description: Build and publish a blueprint package - the manifest, the bundle, and the specs that stop the two from drifting apart.
---

You want your own application shape: your navigation, your page shapes, your palette. That is a blueprint,
and it is a package like any other.

This guide assumes you have built a React package before and know what a `ui profile` is. If you want to
understand *why* blueprints are a separate package kind first, read
[understanding blueprints](./understanding-blueprints.md).

## What you are producing

Two things, and the relationship between them is the whole discipline:

- a **`ScenePackage`** manifest - the declaration: a name, a kind, dependencies, and the *names* of
  everything you contribute;
- a **`ScenePackageBundle`** - the implementation: the real React components, layouts, templates, screens
  and themes behind those names.

The manifest is platform-agnostic and lives in the model, because design-time tooling reads it without ever
loading a component. The bundle is what a renderer needs.

## 1. Declare the manifest

```ts
import { PackageKind, ScenePackage } from '@cratis/scene.model';

export const myBlueprintManifest: ScenePackage = {
    name: 'Acme.Blueprint',
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'PrimeReact' }, { name: 'Cratis.Components' }],
    components: ['appShell', 'topbar', 'menu'],
    layouts: ['AppShell'],
    screenTemplates: ['Dashboard'],
    dialogTemplates: ['ConfirmDialog'],
    themes: ['Acme Light'],
    displayName: 'Acme Blueprint',
    description: 'Acme\'s application shape.',
    module: '@acme/scene.blueprint',
};
```

`dependencies` is the part worth getting right. Your shells are built out of somebody else's widgets - say
so. A profile that activates your blueprint without them renders a shell whose every control is a dashed
red placeholder, and declaring the dependency is what lets that be reported while the profile is being
configured rather than discovered when someone opens the page.

`layouts` lists **only** application shells. A dashboard is a screen template, not a layout.

## 2. Register the components

Registry keys pair the package name with the bare name, and are always built rather than written:

```ts
import { ComponentRegistry, componentRegistryKey } from '@cratis/scene.react';

export const myBlueprintComponents: ComponentRegistry = {
    [componentRegistryKey('Acme.Blueprint', 'appShell')]: AppShell,
    [componentRegistryKey('Acme.Blueprint', 'topbar')]: Topbar,
    [componentRegistryKey('Acme.Blueprint', 'menu')]: Menu,
};
```

The separator is the registry's own business - deliberately not the `.` a screen uses to qualify a name, so
a package name containing dots stays unambiguous. Building a key by hand is how a component ends up
registered under something no lookup will ever produce.

Every component takes the same props:

```tsx
import { RegisteredComponentProps } from '@cratis/scene.react';

export function Menu({ element, slots }: RegisteredComponentProps) {
    return (
        <nav data-scene-id={element.id}>
            <ul className='layout-menu'>{slots.items}</ul>
        </nav>
    );
}
```

Read `element.properties` through typed accessors that fall back rather than casting. The bag carries
whatever a template author wrote and Scene never re-validates it, so a component that trusts it renders
`[object Object]` the first time a template has a typo.

## 3. Define the layouts

A layout is named slots plus an optional arrangement:

```ts
import { Layout } from '@cratis/scene.model';

export const appShellLayout: Layout = {
    name: 'AppShell',
    slots: [{ name: 'topbar' }, { name: 'menu' }, { name: 'content' }],
    arrangement: appShellArrangement,
};
```

Give the arrangement overrides for the size classes that change it, and let `evaluateFlowArrangement` pick.
An override targeting both axes beats one targeting a single axis, which is what makes a phone in landscape
get its own answer rather than whichever single-axis override happened to be declared last.

## 4. Define the templates

Every screen template names, in `fitsSlot`, the slot on its parent that it occupies:

```ts
import { ScreenTemplate } from '@cratis/scene.model';

export const dashboardTemplate: ScreenTemplate = {
    name: 'Dashboard',
    fitsSlot: 'content',
    slots: [{ name: 'stats' }, { name: 'primary' }, { name: 'secondary' }],
    content: {},
    displayName: 'Dashboard',
    description: 'Four stat cards over two columns of widgets.',
};
```

Dialog templates are the same minus `fitsSlot`, because a dialog is summoned rather than placed.

## 5. Assemble the bundle

```ts
import { ScenePackageBundle } from '@cratis/scene.react';

export const myBlueprint: ScenePackageBundle = {
    manifest: myBlueprintManifest,
    components: myBlueprintComponents,
    layouts: [appShellLayout],
    screenTemplates: [dashboardTemplate],
    dialogTemplates: [confirmDialogTemplate],
    screens: myGalleryScreens,
    themes: [acmeLight],
};
```

## 6. Prove the two halves agree

This is the step that is tempting to skip and expensive to skip.

```ts
import { validatePackageBundle } from '@cratis/scene.react';

describe('when validating the bundle', () => {
    const problems = validatePackageBundle(myBlueprint);

    it('should report no problems', () => {
        problems.should.be.empty;
    });
});
```

A manifest promising a component the bundle never registered renders as a dashed red box somewhere deep
inside a screen, a long way from the declaration that caused it. A component registered but not declared is
invisible to `resolveComponentName`, so no screen can ever name it. Both are silent, which is why every
blueprint runs this.

Three more checks are worth having, and each one caught something real while the default blueprint was
being built:

- **Every gallery screen fills only slots its layout declares.** Filling a slot the layout does not declare
  is a screen that renders empty with nothing to explain it.
- **Every component name a template references resolves** against a profile listing your dependencies. A
  name nothing declares is a placeholder in the middle of a page.
- **Every theme has `author`, `authorUrl` and `license` set**, and declares compatibility with every package
  the profile activates - `core` included, since there is no implicit exemption for it.

## 7. Ship a gallery

Ship real `Screen` instances alongside your templates, and boot them through the real engine.

This costs almost nothing and buys something specific: when a component name in a template is wrong, the
gallery is where it goes red - during *your* specs, rather than in somebody's application three weeks
later.

## Style it against the tokens

Reference the [shared tokens](./theme-tokens.md), aliased once into locals of your own, and never
a component library's variables directly. That indirection is what lets one blueprint work across
PrimeReact versions and lets a host override the look without editing your rules.

## A domain blueprint

Everything above is a *foundation* blueprint: it brings a shell and the shapes every application has. A **domain blueprint** is the other
kind - a CRM, a project tracker, a ticketing desk - and it brings no shell at all. It depends on the foundation set, reuses its layouts, slots,
components and themes, and adds what is particular to the domain: templates, a **ready-to-use screen set**, **sample-data packs** and
**thumbnails**. All seven start from the same scaffold and are held to the same definition of done.

### Scaffold it

```bash
yarn new-blueprint crm "CRM" "Leads, accounts and deals for a sales team."
yarn
cd Source/JavaScript/blueprint.crm && yarn build && UPDATE_BLUEPRINT_CATALOG=1 yarn test
cd ../../.. && node ./verify-blueprints.js --write
```

The generator writes `Source/JavaScript/blueprint.<domain>` with the layout every domain blueprint shares:

```
blueprint.crm/
  package.json            a workspace; "files" lists dist, sampleData, thumbnails and blueprintCatalog.json
  packageName.ts          Cratis.Blueprint.Crm - the name a ui profile uses
  manifest.ts             the ScenePackage, including its blueprint metadata
  blueprint.ts            the ScenePackageBundle
  templateProvenance.ts   compatibility, attribution and license every template carries
  templates/              the screen templates (and dialog templates)
  screens/                the ready-to-use Screen instances
  sampleData/crm-en.json  a sample-data pack
  thumbnails/             one thumbnail for the blueprint, one for each template
  for_blueprint/          the specification that verifies the package
  blueprintCatalog.json   the gallery catalog entry, written by the specification
```

What it generates is already *done*: replace the one template, the one screen, the one pack and the thumbnails, and keep the specification
green. CI scaffolds a package on every build and verifies it unchanged, so the generator cannot rot.

### The manifest

A domain blueprint's manifest adds one block, `blueprint`:

```ts
blueprint: {
    domain: 'crm',                                  // lower-case slug; categories are 'Business / crm'
    description: 'Leads, accounts and deals for a sales team.',   // one sentence, at most 200 characters
    thumbnail: 'thumbnails/crm.svg',                // thumbnails/<name>.png | .webp | .jpg | .svg
    screenSet: [                                    // the ready-to-use screens, with their navigation
        { name: 'Dashboard', title: 'Dashboard', order: 0 },
        { name: 'Leads', title: 'Leads', template: 'LeadList', order: 1 },
        { name: 'LeadDetail', title: 'Lead', template: 'LeadDetail', parent: 'Leads' },
    ],
    defaultSampleData: 'crm-en',                    // required when the package ships more than one pack
},
sampleData: [{ id: 'crm-en', title: 'CRM · English', locale: 'en-GB', path: 'sampleData/crm-en.json' }],
```

C# has the same shape (`ScenePackage.Blueprint`, `BlueprintMetadata`, `BlueprintScreen`) and `TemplateMetadata` gains a `thumbnail`; the
shared `scene-model-shape.json` fails the build when the two drift. There is deliberately **no second version** on the blueprint: the
package's `version` is the blueprint's version.

### The definition of done

`verifyBlueprintPackage` (C#: `BlueprintVerification.Verify`) is the one place the rules live, and reports the same problems in the same
order in both engines - `blueprint-verification-fixtures.json` is asserted by both. A domain blueprint is done when:

- the manifest is of kind Blueprint with a valid version, **depends on the foundation set** (`Cratis.Blueprint.Default`), and declares
  its domain, description (200 characters at most) and thumbnail;
- the **screen set** is not empty, names each screen once, gives each a title, points each template at one that exists, each parent at
  a screen in the set (no cycles), and every screen is one the package actually provides;
- **sample data** is present, every reference is valid and its file is in the package, every pack is valid, locale-tagged and owned by the
  blueprint, and when there are several one is the declared default;
- every **template** has a display name, a description, a type from the vocabulary (Shell, Workspace, Dashboard, List, Board, Detail, Form,
  Wizard, Dialog, Auth, State), a `Business / <domain>` category and a thumbnail that is in the package, plus the complete provenance
  `describeTemplateCatalog` already requires (compatibility, author, license);
- every screen template is **placed** by the slot resolver: none unplaced, none ambiguous, none nested inside itself.

A foundation blueprint declares no `blueprint` block and is held to the template, placement and sample-data rules only.

Each blueprint runs the verification as its own specification (`for_blueprint/when_verifying_the_blueprint.ts`), because only a spec runner
resolves a blueprint's dependencies the way a host's bundler does. `yarn verify-blueprints` then makes that impossible to skip: it
fails when a blueprint package has no such specification, when the packed archive lacks `thumbnails/`, `sampleData/` or the catalog or
carries a thumbnail outside `thumbnails/`, and when the root `blueprintCatalog.json` is out of date.

### Version pins

A template reference can pin the blueprint version it was chosen from (`TemplateReference.version`, a range). `evaluateBlueprintPin` (C#:
`BlueprintVersionPin.Evaluate`) is what decides "update available":

| Pin | Installed | Latest | Status |
| --- | --- | --- | --- |
| none (defaults to `^installed`) | 1.2.0 | 1.2.0 | `Current` |
| none | 1.2.0 | 1.4.1 | `UpdateAvailable` |
| none | 1.2.0 | 2.0.0 | `UpdateBlockedByPin` - a new major version is a deliberate move |
| `^1.0.0` | 1.2.0 | 1.9.0 | `UpdateAvailable` |
| `~1.2.0` | 1.2.3 | 1.3.0 | `UpdateBlockedByPin` |
| `^2.0.0` | 1.2.0 | - | `NotSatisfied` - the reference was chosen from a version that is gone |
| not a range / not a version | | | `Invalid` |

A pin is a version range in the same dialect as a package dependency (`^`, `~`, `>=`, exact, `*`); a pre-release suffix is ignored; a
blank pin is the default. The default pin is the caret range of the installed version - `defaultBlueprintPin`.

### The gallery catalog

`describeBlueprintCatalog` (C#: `BlueprintCatalog.Describe`) turns the domain blueprints into what a gallery and the CLI documentation
read: for each, its description, thumbnail, version, license and dependencies, its **screen set in navigation order** (siblings by
`order`, each screen directly followed by its children), its templates with type, category and thumbnail, and its sample-data packs with
the default marked. Each blueprint package ships its own entry as `blueprintCatalog.json`; the repository root `blueprintCatalog.json`
is all of them, in package-name order. A package that only provides foundation layouts and templates is not listed. The file's shape is
`BlueprintCatalogFile` (`schema: 1`); a reader refuses a newer schema.

## Next

- [Composing screens from templates](./composing-screens.md) - the placement rules in full, including the
  one that fails silently.
- [Layout modes](./layout-modes.md) - what the default blueprint implements, if you want the same
  vocabulary.
