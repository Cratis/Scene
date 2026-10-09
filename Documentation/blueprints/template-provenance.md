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
| `compatibility.packages` | No | Each entry names a package and, optionally, a valid version range. The package must be the template's own package or one its package depends on. |
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

## Validate and describe

`validateTemplateMetadata(name, metadata)` returns every missing or invalid field. `describeTemplateCatalog(sources, sceneVersion)` returns one `TemplateCatalogEntry` per template, in package then layout, screen template and dialog template order. Each entry carries the package and its version, the template's display fields, its compatibility, attribution and license, a `compatible` flag and the `problems` behind it.

An entry is compatible when its metadata is valid, the Scene version (when given) satisfies `compatibility.scene`, and every required package is present at a satisfying version. Nothing is filtered out: a browser shows an incompatible template with its reasons.

`resolvePackageHost` exposes the catalog as `templates`, built from the approved bundles. Set `sceneVersion` on the host configuration to have the Scene range checked. A blocked host describes no templates.

The C# twins are `TemplateMetadataValidation.Validate` and `TemplateCatalog.Describe`. Both engines run the shared `template-metadata-fixtures.json` corpus.

## The built-in templates

Both Cratis blueprints apply one provenance object to every template they ship: `defaultBlueprintTemplateProvenance` and `componentsBlueprintTemplateProvenance`. Their specs describe each blueprint's catalog against the shipped package versions and require every template to come out compatible. The default blueprint's `AppShell` layout and `Dashboard` template carry an attribution notice, because their arrangement follows PrimeTek's Sakai template.
