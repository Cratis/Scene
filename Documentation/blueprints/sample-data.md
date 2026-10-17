# Sample data packs

Sample data is what a design surface or a preview shows in a table, a list or a chart before a real backend feeds it. It is a **design and preview time** concept only: a Stage production build never includes it and never resolves it.

A component keeps declaring **shapes** (what a row looks like) and never carries demo rows. The rows come from a **sample-data pack**, or, when no pack has them, from a deterministic generator that follows the shape.

## One place to choose: the UI profile

The active pack is chosen **once for the whole application**, on the application's [UI profile](../glossary.md). It is not chosen per screen, slice or component, because demo data spans several domains and one choice, inherited everywhere, keeps the preview consistent.

```typescript
const profile: UiProfile = {
    name: 'Desktop',
    targetPlatform: 'web',
    packages: ['core', '@cratis/scene.blueprint.crm'],
    sampleData: {
        activePack: 'crm-nordic-smb',
        mappings: [{ shape: 'Customer', readModel: 'Accounts' }],
        bindings: [],
    },
};
```

`sampleData` is a `SampleDataSelection`:

| Member | Meaning |
| --- | --- |
| `activePack` | The id of the pack the whole application previews with: one of the author's own packs or one a blueprint ships. Absent falls through to the blueprint's default pack, then generated data. |
| `mappings` | Explicit `shape → read model` pairs, for where a pack's shape name is not the read model's name. |
| `bindings` | A pack bound to one read model or shape. A rare override of the active pack for that target only. |

The preview strip's pack selector is a **session-only override** of `activePack`. It is passed to the resolver as `sessionActivePack` and is never stored, so the profile stays the single source of truth. The empty string (the id of the *Generic* entry) means "no active pack for this session".

## Resolution order

`resolveSampleData(request, context)` (TypeScript) and `SampleDataResolver.Resolve` (C#) pick the rows for a read model or shape, trying in order:

1. **Bound pack** — a pack bound to the read model or shape in `sampleData.bindings`.
2. **Active pack** — the profile's `sampleData.activePack`, or the session override.
3. **Blueprint default** — the default pack of the blueprint the template came from.
4. **Generated** — rows generated from the request's shape.

A pack supplies rows when it has a *set* for the target. A set matches by an explicit mapping first (`mappings` whose `readModel` is the target), and otherwise by **name**: the set's `shape` equals the target, compared exactly. A rung that cannot supply rows falls through to the next. An unknown pack id, or a bound pack without the target's shape, is reported in `diagnostics` (`packNotFound`, `shapeNotInPack`); an active or blueprint pack that merely lacks a shape is normal and is not reported.

The result says which rung supplied the rows (`source`), the supplying `pack`, and the `locale` the data follows: the pack's, or for generated data the first existing bound, active or blueprint pack's locale, else the context's (default `en-GB`).

Outside design and preview (`isDesignOrPreview` not `true`, which is the default) nothing resolves and `source` is `disabled`.

## Pack format

```json
{
    "id": "crm-nordic-smb",
    "title": "CRM · Nordic SMB",
    "locale": "nb-NO",
    "owner": "blueprint:crm",
    "sets": [
        { "shape": "Customer", "rows": [{ "id": "n1", "name": "Fjordline AS", "status": "Active" }] }
    ]
}
```

- `id`: lower-case letters and digits in groups separated by `.`, `_` or `-`.
- `locale`: a BCP 47 tag (`nb-NO`, `en-GB`).
- `owner`: `user` for the author's own pack, `blueprint:<id>` for one a blueprint ships.
- The label the UI shows is `<Blueprint> · <Pack>` (`CRM · Nordic SMB`); the generated fallback is `Generic (typed by field kind)`.

## Shipping packs in a blueprint

A `Blueprint` package declares its packs in its manifest and ships each as `sampleData/<name>.json`:

```typescript
sampleData: [{ id: 'crm-nordic-smb', title: 'CRM · Nordic SMB', locale: 'nb-NO', path: 'sampleData/crm-nordic-smb.json' }]
```

A reference also describes the pack for a picker and a preview: a one-line `description`, the ordered `columns` of its main table, the `statusColumn` and the `statuses` - which values of that column
are `good`, `pending`, `bad` or `neutral`. A host draws pills from `classifySampleStatus(statuses, value)` (C#: `SampleStatuses.Classify`); values are compared without regard to letter case, the same
way in every locale, so a pack lists the words of its own language, and a value it does not name is neutral. The **generic** pack - what a preview uses when none is chosen - is described the same way
(`Name`, `Amount`, `Date`, `Status` with *Active*, *Pending* and *Inactive*), and `describeSampleDataCatalog` carries all of it on every entry.

> **Production builds never include sample data.** It exists for the preview only; this is the help text a designer shows beside the choice (`sampleDataNeverShipsNote`). A preview's caption is
> composed by the host from the pack title and the package-list answer: *Nordic SMB sample data - DataTable from Cratis Components* (the pack's title and the package that supplies the component).

`validateSampleDataPackages` (C#: `SampleDataValidation.ValidatePackages`) checks what packages ship: only a Blueprint package may ship packs; each reference needs a valid id, title, locale and path with nothing repeated; each loaded pack must be valid, match its reference, be owned by a blueprint and be one the manifest references. `validateSampleDataSelection` checks a profile's `sampleData` against the packs available. `describeSampleDataCatalog` builds the selector's content (generated, own, then each blueprint's group) for the UI profile's property editor and the preview strip, with the same *own first, then Blueprints* menu pattern as the template picker.

The pack files stay in `sampleData/` of the package and never in `dist/`, so a runtime bundle cannot carry them; `yarn verify-packages` fails when they do.

## The deterministic generator

`generateSample(shape, seed, rowCount, locale)` (C#: `SampleDataGenerator.Generate`) returns the same rows for the same inputs, **byte-identical in the C# and TypeScript engines**. Shapes list fields by `name`, `type`, optional `kind`, `nullable`, `enumValues`, `min` and `max`. The kind of a field is the explicit `kind`, else `enum` when it has values, else a recognised `type` (`Guid`, `int`, `decimal`, `bool`, `DateOnly`, `DateTime`, …), else a name hint (`customerId`, `email`, `phone`, `company`, `city`, person-like names), else `text`.

| Kind | Value |
| --- | --- |
| `id` | A UUID-shaped string |
| `name`, `company`, `email`, `phone`, `city`, `text` | Drawn from the locale's pools (`en-GB`, `en-US`, `nb-NO`, `sv-SE`, `de-DE`; a language tag uses its default pool, an unknown tag `en-GB`) |
| `wholeNumber`, `amount` | Within `min`/`max`; amounts have two decimals |
| `boolean` | `true` or `false` |
| `date`, `dateTime` | Within 2024-2025; `yyyy-MM-dd` and UTC `yyyy-MM-ddTHH:mm:ssZ` |
| `enum` | One of `enumValues` only |

A nullable field is null one time in five. Row `i` does not depend on how many rows are asked for (the default is 5, at most 1000).

### The algorithm

All arithmetic is on wrapping unsigned 32-bit integers.

- `hash32(x)`: `x = (x ^ (x >>> 16)) * 0x85EBCA6B; x = (x ^ (x >>> 13)) * 0xC2B2AE35; return x ^ (x >>> 16)`.
- `splitmix32(state)`: `state += 0x9E3779B9`, then `hash32(state)`.
- `fnv1a32(text)`: FNV-1a over the UTF-8 bytes (offset basis `0x811C9DC5`, prime `0x01000193`).
- The generator is **xoshiro128\*\*** seeded with four consecutive `splitmix32` outputs of the seed; `nextInt(bound)` is `next() % bound`.
- Row `i` of shape `S` with seed `n` uses its own generator seeded with `hash32((n ^ fnv1a32(S)) + (i + 1) * 0x9E3779B9)`.
- Fields are drawn in declaration order. A nullable field first draws `nextInt(5) == 0` for null, then always draws its value.

## Shared fixtures and the SD1 guard

`sample-data-resolution-fixtures.json` is asserted independently by `Source/DotNET/Engine.Specs/for_SampleData` and `Source/JavaScript/engine/for_sampleData`: golden generated rows per kind and locale, every resolution rung, the session override, mappings against name matches, unmapped shapes falling to generated data, and pack, selection, package and catalog validation.

Components must not carry row literals (spec SD1). `findDescriptorSampleRowLiterals` and `findTemplateSampleRowLiterals` find them; the descriptor specs assert none exist, and the template spec holds an allow-list of the seeds that remain until the blueprint library moves them into packs.
