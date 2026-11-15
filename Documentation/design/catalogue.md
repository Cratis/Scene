---
title: The design catalogue
description: What a design is grounded in and how a tool asks about it - components with only the variants the design system declares, templates and their outlets, tokens, themes, the profile and the host's data.
---

A design may only use what exists. The catalogue is *all that exists*, built once from the host's inputs and never by a model.

```ts
import { buildDesignCatalogue, queryDesignCatalogue } from '@cratis/scene.design';

const catalogue = buildDesignCatalogue({ designSystem, themes, profile, descriptors, templates, shapes, queries, commands, sampleData });
const answer = queryDesignCatalogue(catalogue, { what: 'components', fitsTemplate: 'ListScreen' });
```

```csharp
var catalogue = DesignCatalogueBuilder.Build(input);
var answer = DesignCatalogueQueries.Answer(catalogue, new DesignCatalogueQuery("components", FitsTemplate: "ListScreen"));
```

## What goes in

Only the component descriptors and the templates are required; everything else grounds the design further.

| Input | Becomes |
| --- | --- |
| Resolved design system | Tokens (with their value per theme and mode), design-system components with their variants and states, words |
| Themes | Themes of the design system plus flat themes a package ships |
| UI profile | The profile entry and the values its keys take (themes, colour schemes, corners, fonts, root templates, templates for new screens) |
| Component descriptors | Components: properties with kinds and choices, category, where they may be placed, anatomy |
| Screen templates | Templates with their outlets and what each outlet takes. Root templates only feed the profile's `rootTemplate` values. |
| Shapes, queries, commands, sample data | Entries a screen may bind to |
| Template set | When given, only these templates are listed; see [Design operations](operations.md#template-set) |

## Components keep to the design system

A component's anatomy (parts, variants, states, and the property that chooses the variant) is intersected with what the design system declares for the component it is bound to
- by `mapsTo`, else by a name match. The variants a component offers are therefore *only* those both sides declare, and the variant property's choices are reduced to them. A design cannot ask for a
`danger` button when the design system has none; it gets a refusal with a proposal to add one.

## Placement

Every component has a placement: **outlet** (put in an outlet of a screen), **overlay** (the `Overlay` category - opened from an action, never placed) or **shell** (category `Shell`, or named by the host - part of the root template).
An outlet takes a component when it is open (nothing is known about it), names the component (derived from the template's own content, or the host's rule) or takes its category. Each component lists
the outlets that take it as `fits`.

## Asking

| `what` | Answers |
| --- | --- |
| `components` (`category`, `fitsTemplate`, `fitsOutlet`, `search`) / `component` (`name`, the id or the bare name) | list / full description |
| `templates` / `template` | list / outlets with what each takes |
| `tokens` (`category`) / `token` (`address`) | list / values per theme and mode |
| `designComponents` / `designComponent` | the design system's components and variants |
| `themes`, `profile`, `words` | as listed |
| `shapes` / `shape`, `queries` / `query`, `commands` / `command` | host data |

An answer is `{ found, items }`, `{ found, item }` or `{ found: false }`. It never contains anything the catalogue does not list, so a model reading it cannot invent a component, template, token or variant.
