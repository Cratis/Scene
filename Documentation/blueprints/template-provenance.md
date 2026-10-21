---
title: Template compatibility, attribution and license
description: The compatibility, attribution and license metadata every shipped template carries, how it is validated, and how a template browser reads it from the catalog.
---

An author choosing a template needs three answers before they choose it: will it work with the packages and the Scene version I have, who made it, and what am I taking on by using it. Every template a Scene blueprint ships carries that metadata. The template catalog checks it and reports the answers.

## Metadata fields

The fields live on `TemplateMetadata`, beside `type`, `category` and `scopes`. Layouts, screen templates and dialog templates all carry them. The C# model has the same shape.

| Field | Required | Rules |
| --- | --- | --- |
| `compatibility.scene` | Yes | A version range such as `^4.13.0`, in the subset `isVersionSatisfiedBy` understands. |
| `compatibility.packages` | No | Each entry names a package and, optionally, a valid version range. The package may be the template's own package, one its package depends on, or any other package. A requirement on a package the owner does not depend on is opt-in: the template is available only while the host or profile provides that package at a satisfying version, and is reported unavailable otherwise. |
| `attribution.author` | Yes | The person or organization that authored the template. |
| `attribution.url` | No | An absolute `https` URL. |
| `attribution.notice` | No | A notice a license requires to travel with the template. |
| `license` | Yes | An SPDX expression: identifiers such as `MIT` or `Apache-2.0`, optionally joined by `AND`, `OR` or `WITH`. |
| `licenseUrl` | No | An absolute `https` URL. |

```typescript
metadata: {
    type: 'List',
    category: 'Business / List',
    compatibility: { scene: '^4.13.0', packages: [{ name: 'Cratis.Components', versionRange: '^3.0.0' }] },
    attribution: { author: 'Cratis', url: 'https://github.com/Cratis/Scene' },
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
}
```

## Template references and the version pin

A module, feature or slice refers to a template with a `TemplateReference`:

```typescript
{ source: TemplateReferenceSource.Own, id: 'Module Workspace' }
{ source: TemplateReferenceSource.Blueprint, blueprint: 'crm', id: 'CRM Workspace', version: '^1.4.2' }
```

| Field | Meaning |
| --- | --- |
| `source` | `Own` for a template the user created, `Blueprint` for one a blueprint package ships. |
| `id` | The template's name - in the workspace, or within the blueprint. |
| `blueprint` | The blueprint package name; required for `Blueprint`, forbidden for `Own`. |
| `version` | A semver range of the blueprint the reference accepts. The `reference` an applicable template carries defaults to `^<installed version>`; absent means any version. Forbidden for `Own`. |

`resolveTemplateReference(reference, library)` (C# `TemplateReferenceResolver.Resolve`) returns a status and, when the reference does not resolve, a message:

| Status | Meaning |
| --- | --- |
| `Resolved` | The template exists at an accepted version. The resolution carries the package, its installed version and the template kind. |
| `Malformed` | Not well formed: an own reference with a blueprint or version, a blueprint reference without a blueprint, an empty id or an invalid range. |
| `UnknownBlueprint` | No blueprint package of that name is available. |
| `VersionNotSatisfied` | The installed blueprint is outside the pinned range - the blueprint has drifted since the template was chosen. |
| `UnknownTemplate` | The blueprint or workspace has no template of that name. |

Copying a blueprint template into the user's own templates is expressed by creating an own template and referencing it with `source: Own`.

## Category

Every template declares a `category`. A blueprint template without one is a problem in its catalog entry; an own template without one is a warning. See [Category is required](template-applicability.md#category-is-required).

## Validate and describe

`validateTemplateMetadata(name, metadata)` returns every missing or invalid field. `describeTemplateCatalog(sources, sceneVersion)` returns one `TemplateCatalogEntry` per template, in package then layout, screen template and dialog template order. Each entry carries the package and its version, the template's display fields, its compatibility, attribution and license, a `compatible` flag, the `problems` behind it and non-blocking `warnings`.

An entry is compatible when its metadata is valid, the Scene version (when given) satisfies `compatibility.scene`, and every required package is present at a satisfying version. Nothing is filtered out: a browser shows an incompatible template with its reasons.

`resolvePackageHost` exposes the catalog as `templates`, built from the approved bundles. Set `sceneVersion` on the host configuration to have the Scene range checked. A blocked host describes no templates.

The C# twins are `TemplateMetadataValidation.Validate` and `TemplateCatalog.Describe`. Both engines run the shared `template-metadata-fixtures.json` corpus.

## The built-in templates

Both Cratis blueprints apply one provenance object to every template they ship: `defaultBlueprintTemplateProvenance` and `componentsBlueprintTemplateProvenance`. Their specs describe each blueprint's catalog against the shipped package versions and require every template to come out compatible. The default blueprint's `AppShell` layout and `Dashboard` template carry an attribution notice, because their arrangement follows PrimeTek's Sakai template.
